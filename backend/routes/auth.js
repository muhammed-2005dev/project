const express = require('express');
const { body } = require('express-validator');
const { 
  protect, 
  loginRateLimit, 
  registerRateLimit, 
  passwordResetRateLimit 
} = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { createTokenResponse } = require('../utils/jwt');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');
const User = require('../models/User');
const AppError = require('../utils/appError');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerRateLimit, registerValidation, catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password
  });

  // Generate email verification token
  const token = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send welcome email
  try {
    await sendWelcomeEmail(user, token);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't fail registration if email fails
  }

  createTokenResponse(user, 201, res);
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginRateLimit, loginValidation, catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Get user with password
  const user = await User.findByEmail(email).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account is deactivated', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  createTokenResponse(user, 200, res);
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', protect, catchAsync(async (req, res, next) => {
  const { firstName, lastName, phone, preferences } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { firstName, lastName, phone, preferences },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
}));

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match new password');
    }
    return true;
  })
], catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
}));

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', passwordResetRateLimit, forgotPasswordValidation, catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  // Generate password reset token
  const token = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send password reset email
  try {
    await sendPasswordResetEmail(user, token);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(new AppError('Error sending email. Please try again.', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Password reset token sent to email'
  });
}));

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put('/reset-password/:token', resetPasswordValidation, catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createTokenResponse(user, 200, res);
}));

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', catchAsync(async (req, res, next) => {
  const { token } = req.params;

  // Hash token
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  // Verify email
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
}));

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
router.post('/resend-verification', protect, catchAsync(async (req, res, next) => {
  const user = req.user;

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate new verification token
  const token = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    await sendWelcomeEmail(user, token);
  } catch (error) {
    return next(new AppError('Error sending verification email. Please try again.', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Verification email sent'
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, catchAsync(async (req, res, next) => {
  // In a JWT-based system, logout is typically handled on the client side
  // by removing the token from storage. However, we can add token blacklisting
  // or other server-side logic here if needed.
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
}));

module.exports = router;
