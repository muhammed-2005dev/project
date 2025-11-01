const express = require('express');
const { body, query } = require('express-validator');
const { protect, authorize, contactRateLimit } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { uploadMultiple } = require('../utils/cloudinary');
const { sendContactNotificationEmail } = require('../utils/email');
const Contact = require('../models/Contact');
const AppError = require('../utils/appError');

const router = express.Router();

// Validation rules
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('subjectAr').trim().notEmpty().withMessage('Arabic subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('messageAr').trim().notEmpty().withMessage('Arabic message is required'),
  body('type').optional().isIn(['general', 'complaint', 'suggestion', 'support', 'business', 'partnership']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
];

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
router.post('/', contactRateLimit, uploadMultiple('contactAttachments', 5), contactValidation, catchAsync(async (req, res, next) => {
  const contactData = req.body;

  // Add attachments if uploaded
  if (req.files && req.files.length > 0) {
    contactData.attachments = req.files.map(file => ({
      filename: file.originalname,
      url: file.path,
      publicId: file.filename,
      size: file.size,
      mimeType: file.mimetype
    }));
  }

  // Add IP address and user agent
  contactData.ipAddress = req.ip;
  contactData.userAgent = req.get('User-Agent');

  const contact = await Contact.create(contactData);

  // Send notification email to admin
  try {
    await sendContactNotificationEmail(contact);
  } catch (error) {
    console.error('Failed to send contact notification email:', error);
    // Don't fail contact submission if email fails
  }

  res.status(201).json({
    status: 'success',
    message: 'Contact form submitted successfully',
    data: {
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        type: contact.type,
        priority: contact.priority,
        status: contact.status,
        createdAt: contact.createdAt
      }
    }
  });
}));

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private/Admin
router.get('/', protect, authorize('admin'), [
  query('status').optional().isIn(['new', 'in-progress', 'resolved', 'closed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('type').optional().isIn(['general', 'complaint', 'suggestion', 'support', 'business', 'partnership']),
  query('assignedTo').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], catchAsync(async (req, res, next) => {
  const { status, priority, type, assignedTo, page = 1, limit = 10 } = req.query;
  
  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (type) filter.type = type;
  if (assignedTo) filter.assignedTo = assignedTo;

  // Pagination
  const skip = (page - 1) * limit;

  const contacts = await Contact.find(filter)
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Contact.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: contacts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      contacts
    }
  });
}));

// @desc    Get single contact submission
// @route   GET /api/contact/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id)
    .populate('assignedTo', 'firstName lastName email')
    .populate('responses.author', 'firstName lastName');

  if (!contact) {
    return next(new AppError('Contact submission not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      contact
    }
  });
}));

// @desc    Update contact submission
// @route   PUT /api/contact/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), [
  body('status').optional().isIn(['new', 'in-progress', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('assignedTo').optional().isMongoId()
], catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact submission not found', 404));
  }

  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('assignedTo', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    data: {
      contact: updatedContact
    }
  });
}));

// @desc    Add response to contact submission
// @route   POST /api/contact/:id/respond
// @access  Private/Admin
router.post('/:id/respond', protect, authorize('admin'), [
  body('message').trim().notEmpty().withMessage('Response message is required'),
  body('messageAr').trim().notEmpty().withMessage('Arabic response message is required'),
  body('isInternal').optional().isBoolean()
], catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact submission not found', 404));
  }

  const response = {
    message: req.body.message,
    messageAr: req.body.messageAr,
    author: req.user._id,
    isInternal: req.body.isInternal || false
  };

  contact.responses.push(response);
  await contact.save();

  // Populate the response author
  await contact.populate('responses.author', 'firstName lastName');

  res.status(201).json({
    status: 'success',
    data: {
      contact
    }
  });
}));

// @desc    Assign contact to user
// @route   PUT /api/contact/:id/assign
// @access  Private/Admin
router.put('/:id/assign', protect, authorize('admin'), [
  body('assignedTo').isMongoId().withMessage('Valid user ID is required')
], catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact submission not found', 404));
  }

  contact.assignedTo = req.body.assignedTo;
  await contact.save();

  // Populate assigned user
  await contact.populate('assignedTo', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    data: {
      contact
    }
  });
}));

// @desc    Resolve contact submission
// @route   PUT /api/contact/:id/resolve
// @access  Private/Admin
router.put('/:id/resolve', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact submission not found', 404));
  }

  contact.status = 'resolved';
  contact.resolvedAt = new Date();
  await contact.save();

  res.status(200).json({
    status: 'success',
    data: {
      contact
    }
  });
}));

// @desc    Close contact submission
// @route   PUT /api/contact/:id/close
// @access  Private/Admin
router.put('/:id/close', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact submission not found', 404));
  }

  contact.status = 'closed';
  contact.closedAt = new Date();
  await contact.save();

  res.status(200).json({
    status: 'success',
    data: {
      contact
    }
  });
}));

// @desc    Rate contact resolution
// @route   POST /api/contact/:id/rate
// @access  Public
router.post('/:id/rate', [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  body('commentAr').optional().trim().isLength({ max: 500 }).withMessage('Arabic comment cannot exceed 500 characters')
], catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact submission not found', 404));
  }

  if (contact.status !== 'resolved' && contact.status !== 'closed') {
    return next(new AppError('Contact must be resolved before rating', 400));
  }

  contact.satisfaction = {
    rating: req.body.rating,
    comment: req.body.comment,
    commentAr: req.body.commentAr,
    ratedAt: new Date()
  };

  await contact.save();

  res.status(200).json({
    status: 'success',
    message: 'Rating submitted successfully',
    data: {
      satisfaction: contact.satisfaction
    }
  });
}));

// @desc    Get contact statistics
// @route   GET /api/contact/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const stats = await Contact.getStats();

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {}
    }
  });
}));

// @desc    Get unresolved contacts
// @route   GET /api/contact/unresolved/list
// @access  Private/Admin
router.get('/unresolved/list', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const contacts = await Contact.findUnresolved();

  res.status(200).json({
    status: 'success',
    results: contacts.length,
    data: {
      contacts
    }
  });
}));

// @desc    Delete contact submission
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact submission not found', 404));
  }

  // Delete attachments from Cloudinary
  if (contact.attachments && contact.attachments.length > 0) {
    const { deleteMultipleFiles } = require('../utils/cloudinary');
    const publicIds = contact.attachments.map(attachment => attachment.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error('Error deleting contact attachments:', error);
    }
  }

  await Contact.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

module.exports = router;
