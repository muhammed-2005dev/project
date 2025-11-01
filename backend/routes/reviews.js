const express = require('express');
const { body, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { uploadMultiple } = require('../utils/cloudinary');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const AppError = require('../utils/appError');

const router = express.Router();

// Validation rules
const reviewValidation = [
  body('service').isMongoId().withMessage('Valid service ID is required'),
  body('booking').isMongoId().withMessage('Valid booking ID is required'),
  body('rating.overall').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('rating.quality').optional().isInt({ min: 1, max: 5 }).withMessage('Quality rating must be between 1 and 5'),
  body('rating.timeliness').optional().isInt({ min: 1, max: 5 }).withMessage('Timeliness rating must be between 1 and 5'),
  body('rating.communication').optional().isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
  body('rating.value').optional().isInt({ min: 1, max: 5 }).withMessage('Value rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  body('commentAr').optional().trim().isLength({ max: 1000 }).withMessage('Arabic comment cannot exceed 1000 characters')
];

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
router.get('/', [
  query('service').optional().isMongoId(),
  query('rating').optional().isInt({ min: 1, max: 5 }),
  query('verified').optional().isBoolean(),
  query('featured').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], catchAsync(async (req, res, next) => {
  const { service, rating, verified, featured, page = 1, limit = 10 } = req.query;
  
  // Build filter
  const filter = { isPublic: true, status: 'approved' };
  if (service) filter.service = service;
  if (rating) filter['rating.overall'] = parseInt(rating);
  if (verified !== undefined) filter.isVerified = verified === 'true';
  if (featured !== undefined) filter.isFeatured = featured === 'true';

  // Pagination
  const skip = (page - 1) * limit;

  const reviews = await Review.find(filter)
    .populate('customer', 'firstName lastName')
    .populate('service', 'name nameAr')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      reviews
    }
  });
}));

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
router.get('/:id', catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('customer', 'firstName lastName')
    .populate('service', 'name nameAr')
    .populate('response.author', 'firstName lastName');

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
}));

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, uploadMultiple('reviewImages', 5), reviewValidation, catchAsync(async (req, res, next) => {
  const reviewData = req.body;

  // Verify booking exists and belongs to user
  const booking = await Booking.findById(reviewData.booking);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.customer.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403));
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    return next(new AppError('Can only review completed bookings', 400));
  }

  // Check if review already exists for this booking
  const existingReview = await Review.findOne({ booking: reviewData.booking });
  if (existingReview) {
    return next(new AppError('Review already exists for this booking', 400));
  }

  // Verify service exists
  const service = await Service.findById(reviewData.service);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  // Set customer
  reviewData.customer = req.user._id;

  // Add images if uploaded
  if (req.files && req.files.length > 0) {
    reviewData.images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      caption: file.originalname
    }));
  }

  const review = await Review.create(reviewData);

  // Populate the created review
  await review.populate('customer', 'firstName lastName');
  await review.populate('service', 'name nameAr');

  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
}));

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, uploadMultiple('reviewImages', 5), reviewValidation, catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if user can update this review
  if (review.customer.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403));
  }

  const reviewData = req.body;

  // Add new images if uploaded
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      caption: file.originalname
    }));
    reviewData.images = [...review.images, ...newImages];
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    reviewData,
    { new: true, runValidators: true }
  )
    .populate('customer', 'firstName lastName')
    .populate('service', 'name nameAr');

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview
    }
  });
}));

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if user can delete this review
  if (review.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  // Delete images from Cloudinary
  if (review.images && review.images.length > 0) {
    const { deleteMultipleFiles } = require('../utils/cloudinary');
    const publicIds = review.images.map(img => img.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error('Error deleting review images:', error);
    }
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

// @desc    Get reviews by service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
router.get('/service/:serviceId', catchAsync(async (req, res, next) => {
  const { serviceId } = req.params;
  const { page = 1, limit = 10, rating } = req.query;

  const skip = (page - 1) * limit;

  // Build filter
  const filter = { service: serviceId, isPublic: true, status: 'approved' };
  if (rating) filter['rating.overall'] = parseInt(rating);

  const reviews = await Review.find(filter)
    .populate('customer', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      reviews
    }
  });
}));

// @desc    Get service review statistics
// @route   GET /api/reviews/service/:serviceId/stats
// @access  Public
router.get('/service/:serviceId/stats', catchAsync(async (req, res, next) => {
  const { serviceId } = req.params;

  const stats = await Review.getServiceStats(serviceId);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }
  });
}));

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
router.post('/:id/helpful', protect, catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if user already marked as helpful
  const alreadyHelpful = review.helpful.users.includes(req.user._id);
  
  if (alreadyHelpful) {
    // Remove helpful
    review.helpful.users = review.helpful.users.filter(
      userId => userId.toString() !== req.user._id.toString()
    );
    review.helpful.count = Math.max(0, review.helpful.count - 1);
  } else {
    // Add helpful
    review.helpful.users.push(req.user._id);
    review.helpful.count += 1;
  }

  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      helpful: review.helpful.count,
      userMarkedHelpful: !alreadyHelpful
    }
  });
}));

// @desc    Respond to review
// @route   POST /api/reviews/:id/respond
// @access  Private/Admin
router.post('/:id/respond', protect, authorize('admin'), [
  body('text').trim().notEmpty().withMessage('Response text is required'),
  body('textAr').trim().notEmpty().withMessage('Arabic response text is required')
], catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  review.response = {
    text: req.body.text,
    textAr: req.body.textAr,
    author: req.user._id,
    respondedAt: new Date()
  };

  await review.save();

  // Populate response author
  await review.populate('response.author', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
}));

// @desc    Moderate review
// @route   PUT /api/reviews/:id/moderate
// @access  Private/Admin
router.put('/:id/moderate', protect, authorize('admin'), [
  body('status').isIn(['pending', 'approved', 'rejected', 'flagged']).withMessage('Invalid status'),
  body('reason').optional().trim(),
  body('notes').optional().trim()
], catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  review.status = req.body.status;
  review.moderation = {
    moderatedBy: req.user._id,
    moderatedAt: new Date(),
    reason: req.body.reason,
    notes: req.body.notes
  };

  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
}));

// @desc    Get featured reviews
// @route   GET /api/reviews/featured/list
// @access  Public
router.get('/featured/list', catchAsync(async (req, res, next) => {
  const reviews = await Review.findFeatured();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
}));

// @desc    Delete review image
// @route   DELETE /api/reviews/:id/images/:imageId
// @access  Private
router.delete('/:id/images/:imageId', protect, catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if user can delete this image
  if (review.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  const image = review.images.id(req.params.imageId);
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

  // Remove image from review
  image.remove();
  await review.save();

  res.status(200).json({
    status: 'success',
    message: 'Image deleted successfully'
  });
}));

module.exports = router;
