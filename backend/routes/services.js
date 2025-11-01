const express = require('express');
const { body, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { uploadMultiple } = require('../utils/cloudinary');
const Service = require('../models/Service');
const AppError = require('../utils/appError');

const router = express.Router();

// Validation rules
const serviceValidation = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('nameAr').trim().notEmpty().withMessage('Arabic service name is required'),
  body('description').trim().notEmpty().withMessage('Service description is required'),
  body('descriptionAr').trim().notEmpty().withMessage('Arabic service description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 hour'),
  body('category').isIn(['engine', 'transmission', 'brakes', 'tires', 'battery', 'diagnostic', 'oil', 'ac', 'other']).withMessage('Invalid category')
];

// @desc    Get all services
// @route   GET /api/services
// @access  Public
router.get('/', [
  query('category').optional().isIn(['engine', 'transmission', 'brakes', 'tires', 'battery', 'diagnostic', 'oil', 'ac', 'other']),
  query('featured').optional().isBoolean(),
  query('active').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], catchAsync(async (req, res, next) => {
  const { category, featured, active, page = 1, limit = 10 } = req.query;
  
  // Build filter
  const filter = {};
  if (category) filter.category = category;
  if (featured !== undefined) filter.isPopular = featured === 'true';
  if (active !== undefined) filter.isActive = active === 'true';

  // Pagination
  const skip = (page - 1) * limit;

  const services = await Service.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Service.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: services.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      services
    }
  });
}));

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      service
    }
  });
}));

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
router.post('/', protect, authorize('admin'), uploadMultiple('serviceImages', 5), serviceValidation, catchAsync(async (req, res, next) => {
  const serviceData = req.body;

  // Add images if uploaded
  if (req.files && req.files.length > 0) {
    serviceData.images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      alt: file.originalname
    }));
  }

  const service = await Service.create(serviceData);

  res.status(201).json({
    status: 'success',
    data: {
      service
    }
  });
}));

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), uploadMultiple('serviceImages', 5), serviceValidation, catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  const serviceData = req.body;

  // Add new images if uploaded
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      alt: file.originalname
    }));
    serviceData.images = [...service.images, ...newImages];
  }

  const updatedService = await Service.findByIdAndUpdate(
    req.params.id,
    serviceData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      service: updatedService
    }
  });
}));

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  // Delete images from Cloudinary
  if (service.images && service.images.length > 0) {
    const { deleteMultipleFiles } = require('../utils/cloudinary');
    const publicIds = service.images.map(img => img.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error('Error deleting service images:', error);
    }
  }

  await Service.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

// @desc    Get service categories
// @route   GET /api/services/categories/list
// @access  Public
router.get('/categories/list', catchAsync(async (req, res, next) => {
  const categories = await Service.distinct('category');
  
  const categoryList = await Promise.all(
    categories.map(async (category) => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      count: await Service.countDocuments({ category, isActive: true })
    }))
  );

  res.status(200).json({
    status: 'success',
    data: {
      categories: categoryList
    }
  });
}));

// @desc    Get featured services
// @route   GET /api/services/featured/list
// @access  Public
router.get('/featured/list', catchAsync(async (req, res, next) => {
  const services = await Service.findPopular();

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services
    }
  });
}));

// @desc    Search services
// @route   GET /api/services/search/:query
// @access  Public
router.get('/search/:query', catchAsync(async (req, res, next) => {
  const { query } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const services = await Service.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { nameAr: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { descriptionAr: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    isActive: true
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Service.countDocuments({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { nameAr: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { descriptionAr: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    isActive: true
  });

  res.status(200).json({
    status: 'success',
    results: services.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      services
    }
  });
}));

// @desc    Delete service image
// @route   DELETE /api/services/:id/images/:imageId
// @access  Private/Admin
router.delete('/:id/images/:imageId', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  const image = service.images.id(req.params.imageId);
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

  // Remove image from service
  image.remove();
  await service.save();

  res.status(200).json({
    status: 'success',
    message: 'Image deleted successfully'
  });
}));

module.exports = router;
