const express = require("express");
const { body, query } = require("express-validator");
const { protect, authorize, checkOwnership } = require("../middleware/auth");
const { catchAsync } = require("../middleware/errorHandler");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const User = require("../models/User");
const AppError = require("../utils/appError");

const router = express.Router();

// Validation rules
const bookingValidation = [
  body("service").isMongoId().withMessage("Valid service ID is required"),
  body("appointmentDate")
    .isISO8601()
    .withMessage("Valid appointment date is required"),
  body("appointmentTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid appointment time is required"),
  body("car.make").trim().notEmpty().withMessage("Car make is required"),
  body("car.model").trim().notEmpty().withMessage("Car model is required"),
  body("car.year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Valid car year is required"),
  body("issue.description")
    .trim()
    .notEmpty()
    .withMessage("Issue description is required"),
];

// @desc    Get available time slots
// @route   GET /api/bookings/available-slots
// @access  Public
router.get(
  "/available-slots",
  [query("date").isISO8601().withMessage("Valid date is required")],
  catchAsync(async (req, res, next) => {
    const { date } = req.query;
    if (!date) {
      return next(new AppError("Please provide a date (YYYY-MM-DD)", 400));
    }
    const appointmentDate = new Date(date);

    // Define available time slots
    const timeSlots = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ];

    // Get booked slots for the date
    const bookedSlots = await Booking.find({
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ["pending", "confirmed", "in-progress"] },
    }).select("appointmentTime");

    const bookedTimes = bookedSlots.map((booking) => booking.appointmentTime);
    const availableSlots = timeSlots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    res.status(200).json({
      status: "success",
      data: {
        availableSlots,
        bookedSlots: bookedTimes,
      },
    });
  })
);

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
router.get(
  "/",
  protect,
  authorize("admin"),
  [
    query("status")
      .optional()
      .isIn([
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ]),
    query("technician").optional().isMongoId(),
    query("date").optional().isISO8601(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  catchAsync(async (req, res, next) => {
    const { status, technician, date, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (technician) filter.technician = technician;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate("customer", "firstName lastName email phone")
      .populate("service", "name price duration")
      .populate("technician", "firstName lastName email phone")
      .sort({ appointmentDate: 1, appointmentTime: 1 })
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

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
router.get(
  "/my-bookings",
  protect,
  [
    query("status")
      .optional()
      .isIn([
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  catchAsync(async (req, res, next) => {
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { customer: req.user._id };
    if (status) filter.status = status;

    // Pagination
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate("service", "name price duration")
      .populate("technician", "firstName lastName email phone")
      .sort({ appointmentDate: -1 })
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get(
  "/:id",
  protect,
  catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "firstName lastName email phone")
      .populate("service", "name price duration")
      .populate("technician", "firstName lastName email phone");

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Check if user can access this booking
    if (
      req.user.role !== "admin" &&
      booking.customer._id.toString() !== req.user._id.toString()
    ) {
      return next(new AppError("Access denied", 403));
    }

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  })
);

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post(
  "/",
  protect,
  bookingValidation,
  catchAsync(async (req, res, next) => {
    const bookingData = req.body;

    // Verify service exists
    const service = await Service.findById(bookingData.service);
    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    // Check if appointment date is in the future
    const appointmentDate = new Date(bookingData.appointmentDate);
    if (appointmentDate < new Date()) {
      return next(new AppError("Appointment date cannot be in the past", 400));
    }

    // Check for conflicting appointments
    const conflictingBooking = await Booking.findOne({
      appointmentDate: appointmentDate,
      appointmentTime: bookingData.appointmentTime,
      status: { $in: ["pending", "confirmed", "in-progress"] },
    });

    if (conflictingBooking) {
      return next(new AppError("Time slot is already booked", 400));
    }

    // Set customer
    bookingData.customer = req.user._id;

    // Set estimated cost and duration from service
    bookingData.estimatedCost = service.price;
    bookingData.estimatedDuration = service.duration;

    const booking = await Booking.create(bookingData);

    // Populate the created booking
    await booking.populate("customer", "firstName lastName email phone");
    await booking.populate("service", "name price duration");

    res.status(201).json({
      status: "success",
      data: {
        booking,
      },
    });
  })
);

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
router.put(
  "/:id",
  protect,
  bookingValidation,
  catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Check if user can update this booking
    if (
      req.user.role !== "admin" &&
      booking.customer.toString() !== req.user._id.toString()
    ) {
      return next(new AppError("Access denied", 403));
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("customer", "firstName lastName email phone")
      .populate("service", "name price duration")
      .populate("technician", "firstName lastName email phone");

    res.status(200).json({
      status: "success",
      data: {
        booking: updatedBooking,
      },
    });
  })
);

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put(
  "/:id/cancel",
  protect,
  catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    } // Check if user can cancel this booking

    if (
      req.user.role !== "admin" &&
      booking.customer.toString() !== req.user._id.toString()
    ) {
      return next(new AppError("Access denied", 403));
    }

    // Update the status
    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  })
);

// @desc    Confirm booking
// @route   PUT /api/bookings/:id/confirm
// @access  Private/Admin
router.put(
  "/:id/confirm",
  protect,
  authorize("admin"),
  catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.status = "confirmed";
    await booking.save();

    // Populate booking
    await booking.populate("customer", "firstName lastName email phone");
    await booking.populate("service", "name price duration");

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  })
);

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  [
    body("status")
      .isIn([
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ])
      .withMessage("Invalid status"),
  ],
  catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.status = req.body.status;
    await booking.save();

    // Populate so the frontend gets the names back immediately
    await booking.populate("customer", "firstName lastName email phone");
    await booking.populate("service", "name price");

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  })
);

// @desc    Assign technician to booking
// @route   PUT /api/bookings/:id/assign
// @access  Private/Admin
router.put(
  "/:id/assign",
  protect,
  authorize("admin"),
  [
    body("technician")
      .isMongoId()
      .withMessage("Valid technician ID is required"),
  ],
  catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Verify technician exists
    const technician = await User.findById(req.body.technician);
    if (!technician || technician.role !== "technician") {
      return next(new AppError("Technician not found", 404));
    }

    booking.technician = req.body.technician;
    await booking.save();

    // Populate technician
    await booking.populate("technician", "firstName lastName email phone");

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  })
);

module.exports = router;
