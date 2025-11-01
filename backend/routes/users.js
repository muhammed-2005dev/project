const express = require('express');
const { body, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { uploadSingle } = require('../utils/cloudinary');
const User = require('../models/User');
const AppError = require('../utils/appError');

const router = express.Router();

// Validation rules
const userValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('role').optional().isIn(['user', 'admin', 'technician']).withMessage('Invalid role')
];

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), [
  query('role').optional().isIn(['user', 'admin', 'technician']),
  query('isActive').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], catchAsync(async (req, res, next) => {
  const { role, isActive, page = 1, limit = 10 } = req.query;
  
  // Build filter
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  // Pagination
  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      users
    }
  });
}));

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
}));

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
router.post('/', protect, authorize('admin'), uploadSingle('profileImage'), userValidation, catchAsync(async (req, res, next) => {
  const userData = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(userData.email);
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Add profile image if uploaded
  if (req.file) {
    userData.profileImage = req.file.path;
  }

  const user = await User.create(userData);

  res.status(201).json({
    status: 'success',
    data: {
      user
    }
  });
}));

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), uploadSingle('profileImage'), userValidation, catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const userData = req.body;

  // Add profile image if uploaded
  if (req.file) {
    userData.profileImage = req.file.path;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    userData,
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
}));

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent deleting own account
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('Cannot delete your own account', 400));
  }

  // Delete profile image from Cloudinary
  if (user.profileImage) {
    const { deleteFile } = require('../utils/cloudinary');
    try {
      await deleteFile(user.profileImage);
    } catch (error) {
      console.error('Error deleting user profile image:', error);
    }
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

// @desc    Deactivate user
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
router.put('/:id/deactivate', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent deactivating own account
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('Cannot deactivate your own account', 400));
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
}));

// @desc    Activate user
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
router.put('/:id/activate', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isActive = true;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
}));

// @desc    Change user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', protect, authorize('admin'), [
  body('role').isIn(['user', 'admin', 'technician']).withMessage('Invalid role')
], catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent changing own role
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('Cannot change your own role', 400));
  }

  user.role = req.body.role;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
}));

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        inactiveUsers: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
        adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        technicianUsers: { $sum: { $cond: [{ $eq: ['$role', 'technician'] }, 1, 0] } },
        regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } },
        verifiedUsers: { $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] } },
        unverifiedUsers: { $sum: { $cond: [{ $eq: ['$isEmailVerified', false] }, 1, 0] } }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {}
    }
  });
}));

// @desc    Get technicians
// @route   GET /api/users/technicians/list
// @access  Private/Admin
router.get('/technicians/list', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const technicians = await User.find({ role: 'technician', isActive: true })
    .select('firstName lastName email phone')
    .sort({ firstName: 1 });

  res.status(200).json({
    status: 'success',
    results: technicians.length,
    data: {
      technicians
    }
  });
}));

// @desc    Search users
// @route   GET /api/users/search/:query
// @access  Private/Admin
router.get('/search/:query', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const { query } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const users = await User.find({
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
    ]
  })
    .select('-password')
    .sort({ firstName: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments({
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      users
    }
  });
}));

module.exports = router;
