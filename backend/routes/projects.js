const express = require('express');
const { body, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { uploadMultiple } = require('../utils/cloudinary');
const Project = require('../models/Project');
const Service = require('../models/Service');
const AppError = require('../utils/appError');

const router = express.Router();

// Validation rules
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('nameAr').trim().notEmpty().withMessage('Arabic project name is required'),
  body('description').trim().notEmpty().withMessage('Project description is required'),
  body('descriptionAr').trim().notEmpty().withMessage('Arabic project description is required'),
  body('service').isMongoId().withMessage('Valid service ID is required'),
  body('client.name').trim().notEmpty().withMessage('Client name is required'),
  body('client.email').isEmail().withMessage('Valid client email is required'),
  body('client.phone').isMobilePhone().withMessage('Valid client phone is required'),
  body('car.make').trim().notEmpty().withMessage('Car make is required'),
  body('car.model').trim().notEmpty().withMessage('Car model is required'),
  body('car.year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid car year is required'),
  body('estimatedDuration').isInt({ min: 1 }).withMessage('Estimated duration must be at least 1 hour'),
  body('cost.estimated').isNumeric().withMessage('Estimated cost must be a number')
];

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get('/', [
  query('service').optional().isMongoId(),
  query('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
  query('featured').optional().isBoolean(),
  query('public').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], catchAsync(async (req, res, next) => {
  const { service, status, featured, public: isPublic, page = 1, limit = 10 } = req.query;
  
  // Build filter
  const filter = {};
  if (service) filter.service = service;
  if (status) filter.status = status;
  if (featured !== undefined) filter.featured = featured === 'true';
  if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

  // Pagination
  const skip = (page - 1) * limit;

  const projects = await Project.find(filter)
    .populate('service', 'name nameAr price')
    .populate('technician', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Project.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: projects.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      projects
    }
  });
}));

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('service', 'name nameAr price duration')
    .populate('technician', 'firstName lastName email phone');

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      project
    }
  });
}));

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
router.post('/', protect, authorize('admin'), uploadMultiple('projectImages', 10), projectValidation, catchAsync(async (req, res, next) => {
  const projectData = req.body;

  // Verify service exists
  const service = await Service.findById(projectData.service);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  // Add images if uploaded
  if (req.files && req.files.length > 0) {
    projectData.images = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      caption: file.originalname,
      type: 'after',
      position: index
    }));
  }

  const project = await Project.create(projectData);

  // Populate the created project
  await project.populate('service', 'name nameAr price duration');

  res.status(201).json({
    status: 'success',
    data: {
      project
    }
  });
}));

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), uploadMultiple('projectImages', 10), projectValidation, catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const projectData = req.body;

  // Add new images if uploaded
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      caption: file.originalname,
      type: 'after',
      position: project.images.length + index
    }));
    projectData.images = [...project.images, ...newImages];
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    projectData,
    { new: true, runValidators: true }
  ).populate('service', 'name nameAr price duration')
   .populate('technician', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    data: {
      project: updatedProject
    }
  });
}));

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  // Delete images from Cloudinary
  if (project.images && project.images.length > 0) {
    const { deleteMultipleFiles } = require('../utils/cloudinary');
    const publicIds = project.images.map(img => img.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error('Error deleting project images:', error);
    }
  }

  await Project.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

// @desc    Get projects by service
// @route   GET /api/projects/service/:serviceId
// @access  Public
router.get('/service/:serviceId', catchAsync(async (req, res, next) => {
  const { serviceId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const projects = await Project.findByService(serviceId)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Project.countDocuments({ service: serviceId, isPublic: true });

  res.status(200).json({
    status: 'success',
    results: projects.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      projects
    }
  });
}));

// @desc    Get featured projects
// @route   GET /api/projects/featured/list
// @access  Public
router.get('/featured/list', catchAsync(async (req, res, next) => {
  const projects = await Project.findFeatured();

  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: {
      projects
    }
  });
}));

// @desc    Add project note
// @route   POST /api/projects/:id/notes
// @access  Private
router.post('/:id/notes', protect, [
  body('text').trim().notEmpty().withMessage('Note text is required'),
  body('textAr').trim().notEmpty().withMessage('Arabic note text is required'),
  body('isInternal').optional().isBoolean()
], catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const note = {
    text: req.body.text,
    textAr: req.body.textAr,
    author: req.user._id,
    isInternal: req.body.isInternal || false
  };

  project.notes.push(note);
  await project.save();

  // Populate the note author
  await project.populate('notes.author', 'firstName lastName');

  res.status(201).json({
    status: 'success',
    data: {
      project
    }
  });
}));

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), [
  body('status').isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
], catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  project.status = req.body.status;
  
  // Set end date if completed
  if (req.body.status === 'completed' && !project.endDate) {
    project.endDate = new Date();
  }

  await project.save();

  res.status(200).json({
    status: 'success',
    data: {
      project
    }
  });
}));

// @desc    Assign technician to project
// @route   PUT /api/projects/:id/assign
// @access  Private/Admin
router.put('/:id/assign', protect, authorize('admin'), [
  body('technician').isMongoId().withMessage('Valid technician ID is required')
], catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  project.technician = req.body.technician;
  await project.save();

  // Populate technician
  await project.populate('technician', 'firstName lastName email phone');

  res.status(200).json({
    status: 'success',
    data: {
      project
    }
  });
}));

// @desc    Delete project image
// @route   DELETE /api/projects/:id/images/:imageId
// @access  Private/Admin
router.delete('/:id/images/:imageId', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const image = project.images.id(req.params.imageId);
  if (!image) {
    return next(new AppError('Image not found', 404));
  }

  // Delete image from Cloudinary
  const { deleteFile } = require('../utils/cloudinary');
  try {
    await deleteFile(image.publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }

  // Remove image from project
  image.remove();
  await project.save();

  res.status(200).json({
    status: 'success',
    message: 'Image deleted successfully'
  });
}));

module.exports = router;
