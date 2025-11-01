const express = require('express');
const mongoose = require('mongoose');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const Service = require('../models/Service');
const Blog = require('../models/Blog');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Contact = require('../models/Contact');
const User = require('../models/User');
const Project = require('../models/Project');
const AppError = require('../utils/appError');

const router = express.Router();

// All admin routes require authentication and admin role
// Temporarily disabled for development
// router.use(protect, authorize('admin'));

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', catchAsync(async (req, res, next) => {
  // Always return mock data for development
  const mockData = {
    overview: {
      totalServices: 12,
      activeServices: 10,
      totalBlogs: 8,
      publishedBlogs: 6,
      totalBookings: 45,
      pendingBookings: 3,
      totalReviews: 23,
      totalContacts: 15,
      totalUsers: 67,
      totalProjects: 5
    },
    monthly: {
      bookings: 12,
      revenue: 2500,
      contacts: 8
    },
    recent: {
      bookings: [
        { id: 1, customer: 'Ahmed Ali', service: 'Engine Repair', date: '2024-01-15', status: 'completed' },
        { id: 2, customer: 'Sara Mohamed', service: 'Oil Change', date: '2024-01-14', status: 'pending' }
      ],
      contacts: [
        { id: 1, name: 'Omar Hassan', email: 'omar@example.com', message: 'Need car service', date: '2024-01-15' },
        { id: 2, name: 'Fatima Ahmed', email: 'fatima@example.com', message: 'Inquiry about pricing', date: '2024-01-14' }
      ],
      services: [
        { id: 1, name: 'Engine Repair', category: 'Repair', status: 'active' },
        { id: 2, name: 'Oil Change', category: 'Maintenance', status: 'active' }
      ],
      blogs: [
        { id: 1, title: 'Car Maintenance Tips', author: 'Admin', status: 'published' },
        { id: 2, title: 'Winter Car Care', author: 'Admin', status: 'draft' }
      ]
    }
  };
  
  return res.status(200).json({
    success: true,
    data: mockData
  });
}));

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', catchAsync(async (req, res, next) => {
  // Always return mock data for development
  const mockUsers = [
    { id: 1, name: 'Ahmed Ali', email: 'ahmed@example.com', role: 'customer', createdAt: '2024-01-10' },
    { id: 2, name: 'Sara Mohamed', email: 'sara@example.com', role: 'customer', createdAt: '2024-01-12' },
    { id: 3, name: 'Omar Hassan', email: 'omar@example.com', role: 'customer', createdAt: '2024-01-14' },
    { id: 4, name: 'Fatima Ahmed', email: 'fatima@example.com', role: 'customer', createdAt: '2024-01-15' },
    { id: 5, name: 'Admin User', email: 'admin@autologic.com', role: 'admin', createdAt: '2024-01-01' }
  ];
  
  return res.status(200).json({
    success: true,
    data: {
      users: mockUsers,
      total: mockUsers.length,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  });

}));

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Get user's bookings and reviews
  const [bookings, reviews] = await Promise.all([
    Booking.find({ user: req.params.id }).sort({ createdAt: -1 }),
    Review.find({ user: req.params.id }).sort({ createdAt: -1 })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        ...user.toObject(),
        bookings,
        reviews
      }
    }
  });
}));

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put('/users/:id/role', [
  body('role').isIn(['user', 'admin']).withMessage('Invalid role')
], catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
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

// @desc    Get all bookings with filters
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get('/bookings', catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;
  const skip = (page - 1) * limit;

  let filter = {};
  if (status) filter.status = status;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const bookings = await Booking.find(filter)
    .populate('user', 'firstName lastName email')
    .populate('service', 'name nameAr price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      bookings
    }
  });
}));

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
router.put('/bookings/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
], catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  booking.status = req.body.status;
  await booking.save();

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
}));

// @desc    Get all contacts
// @route   GET /api/admin/contacts
// @access  Private/Admin
router.get('/contacts', catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;

  let filter = {};
  if (status) filter.status = status;

  const contacts = await Contact.find(filter)
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

// @desc    Update contact status
// @route   PUT /api/admin/contacts/:id/status
// @access  Private/Admin
router.put('/contacts/:id/status', [
  body('status').isIn(['new', 'read', 'replied', 'closed']).withMessage('Invalid status')
], catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  contact.status = req.body.status;
  await contact.save();

  res.status(200).json({
    status: 'success',
    data: {
      contact
    }
  });
}));

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', catchAsync(async (req, res, next) => {
  const { period = '30d' } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case '7d':
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      break;
    case '30d':
      dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      break;
    case '90d':
      dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
      break;
    case '1y':
      dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
      break;
  }

  const [
    bookingStats,
    revenueStats,
    serviceStats,
    blogStats
  ] = await Promise.all([
    Booking.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Booking.aggregate([
      { $match: { createdAt: dateFilter, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]),
    Service.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    Blog.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ])
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      period,
      bookings: bookingStats,
      revenue: revenueStats[0] || { total: 0, count: 0 },
      services: serviceStats,
      blogs: blogStats
    }
  });
}));

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private/Admin
router.get('/health', catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  // Test database connection
  const dbStart = Date.now();
  await mongoose.connection.db.admin().ping();
  const dbTime = Date.now() - dbStart;
  
  const responseTime = Date.now() - startTime;
  
  res.status(200).json({
    status: 'success',
    data: {
      database: {
        connected: true,
        responseTime: `${dbTime}ms`
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        responseTime: `${responseTime}ms`
      },
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;
