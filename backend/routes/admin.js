const express = require("express");
const mongoose = require("mongoose");
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const { catchAsync } = require("../middleware/errorHandler");
const Service = require("../models/Service");
const Blog = require("../models/Blog");
const Booking = require("../models/Booking");
const Contact = require("../models/Contact");
const User = require("../models/User");
const AppError = require("../utils/appError");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize("admin"));

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get(
  "/dashboard",
  catchAsync(async (req, res, next) => {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Run all queries in parallel for speed
    const [
      totalUsers,
      totalServices,
      totalBlogs,
      totalContacts,
      newContacts,
      totalBookings,
      pendingBookings,
      monthlyBookings,
      monthlyRevenue,
      recentBookings,
      recentContacts
    ] = await Promise.all([
      User.countDocuments(),
      Service.countDocuments(),
      Blog.countDocuments(),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$actualCost' } } }
      ]),
      Booking.find({ createdAt: { $gte: startOfToday } })
        .populate('customer', 'firstName lastName')
        .populate('service', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      Contact.find({ status: 'new' })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const liveData = {
      overview: {
        totalUsers,
        totalServices,
        totalBlogs,
        totalContacts,
        newContacts,
        totalBookings,
        pendingBookings
      },
      monthly: {
        bookings: monthlyBookings,
        revenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
        contacts: await Contact.countDocuments({ createdAt: { $gte: startOfMonth } }) // This could be added
      },
      recent: {
        bookings: recentBookings,
        contacts: recentContacts
      }
    };

    res.status(200).json({
      status: "success",
      data: liveData,
    });
  })
);

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
router.get(
  "/users",
  catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, role, query } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (role) filter.role = role;
    if (query) {
      filter.$or = [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: {
        users,
      },
    });
  })
);

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get(
  "/users/:id",
  catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Get user's bookings
    const bookings = await Booking.find({ user: req.params.id }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: {
        user: {
          ...user.toObject(),
          bookings,
        },
      },
    });
  })
);

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put(
  "/users/:id/role",
  [body("role").isIn(["user", "admin"]).withMessage("Invalid role")],
  catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.role = req.body.role;
    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  })
);

// @desc    Get all bookings with filters
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get(
  "/bookings",
  catchAsync(async (req, res, next) => {
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
      .populate("customer", "firstName lastName email phone")
      .populate("technician", "firstName lastName email phone")
      .populate("service", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: {
        bookings,
      },
    });
  })
);

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
router.put(
  "/bookings/:id/status",
  [
    body("status")
      .isIn(["pending", "confirmed", "in-progress", "completed", "cancelled"])
      .withMessage("Invalid status"),
  ],
  catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.status = req.body.status;
    await booking.save();

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  })
);

// @desc    Get all contacts
// @route   GET /api/admin/contacts
// @access  Private/Admin
router.get(
  "/contacts",
  catchAsync(async (req, res, next) => {
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
      status: "success",
      results: contacts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: {
        contacts,
      },
    });
  })
);

// @desc    Update contact status
// @route   PUT /api/admin/contacts/:id/status
// @access  Private/Admin
router.put(
  "/contacts/:id/status",
  [
    body("status")
      .isIn(["new", "read", "replied", "closed"])
      .withMessage("Invalid status"),
  ],
  catchAsync(async (req, res, next) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(new AppError("Contact not found", 404));
    }

    contact.status = req.body.status;
    await contact.save();

    res.status(200).json({
      status: "success",
      data: {
        contact,
      },
    });
  })
);

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private/Admin
router.get(
  "/health",
  catchAsync(async (req, res, next) => {
    const startTime = Date.now();

    // Test database connection
    const dbStart = Date.now();
    await mongoose.connection.db.admin().ping();
    const dbTime = Date.now() - dbStart;

    const responseTime = Date.now() - startTime;

    res.status(200).json({
      status: "success",
      data: {
        database: {
          connected: true,
          responseTime: `${dbTime}ms`,
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          responseTime: `${responseTime}ms`,
        },
        timestamp: new Date().toISOString(),
      },
    });
  })
);

module.exports = router;
