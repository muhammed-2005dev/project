const express = require("express");
const { body, query } = require("express-validator");
const { protect, authorize, contactRateLimit } = require("../middleware/auth");
const { catchAsync } = require("../middleware/errorHandler");
const Contact = require("../models/Contact");
const AppError = require("../utils/appError");

const router = express.Router();

// Validation rules
const contactValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("phone").isMobilePhone().withMessage("Valid phone number is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
  body("type")
    .optional()
    .isIn([
      "general",
      "complaint",
      "suggestion",
      "support",
      "business",
      "partnership",
    ]),
  body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
];

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
router.post(
  "/",
  contactRateLimit,
  contactValidation,
  catchAsync(async (req, res, next) => {
    const contactData = req.body;

    // Add IP address and user agent
    contactData.ipAddress = req.ip;
    contactData.userAgent = req.get("User-Agent");

    const contact = await Contact.create(contactData);

    // Send notification email to admin
    // try {
    //   await sendContactNotificationEmail(contact);
    // } catch (error) {
    //   console.error('Failed to send contact notification email:', error);
    //   // Don't fail contact submission if email fails
    // }

    res.status(201).json({
      status: "success",
      message: "Contact form submitted successfully",
      data: {
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          type: contact.type,
          priority: contact.priority,
          status: contact.status,
          createdAt: contact.createdAt,
        },
      },
    });
  })
);

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private/Admin
router.get(
  "/",
  protect,
  authorize("admin"),
  [
    query("status")
      .optional()
      .isIn(["new", "in-progress", "resolved", "closed"]),
    query("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    query("type")
      .optional()
      .isIn([
        "general",
        "complaint",
        "suggestion",
        "support",
        "business",
        "partnership",
      ]),
    query("assignedTo").optional().isMongoId(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  catchAsync(async (req, res, next) => {
    const {
      status,
      priority,
      type,
      assignedTo,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Pagination
    const skip = (page - 1) * limit;

    const contacts = await Contact.find(filter)
      .populate("assignedTo", "firstName lastName email")
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

// @desc    Get single contact submission
// @route   GET /api/contact/:id
// @access  Private/Admin
router.get(
  "/:id",
  protect,
  authorize("admin"),
  catchAsync(async (req, res, next) => {
    const contact = await Contact.findById(req.params.id).populate(
      "assignedTo",
      "firstName lastName email"
    );

    if (!contact) {
      return next(new AppError("Contact submission not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        contact,
      },
    });
  })
);

// @desc    Update contact submission
// @route   PUT /api/contact/:id
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    body("status")
      .optional()
      .isIn(["new", "in-progress", "resolved", "closed"]),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("assignedTo").optional().isMongoId(),
  ],
  catchAsync(async (req, res, next) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(new AppError("Contact submission not found", 404));
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("assignedTo", "firstName lastName email");

    res.status(200).json({
      status: "success",
      data: {
        contact: updatedContact,
      },
    });
  })
);

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  [
    body("status")
      .isIn(["new", "in-progress", "resolved", "closed"])
      .withMessage("Invalid status"),
  ],
  catchAsync(async (req, res, next) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(new AppError("Contact submission not found", 404));
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

// @desc    Resolve contact submission
// @route   PUT /api/contact/:id/resolve
// @access  Private/Admin
router.put(
  "/:id/resolve",
  protect,
  authorize("admin"),
  catchAsync(async (req, res, next) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(new AppError("Contact submission not found", 404));
    }

    contact.status = "resolved";
    contact.resolvedAt = new Date();
    await contact.save();

    res.status(200).json({
      status: "success",
      data: {
        contact,
      },
    });
  })
);

// @desc    Close contact submission
// @route   PUT /api/contact/:id/close
// @access  Private/Admin
router.put(
  "/:id/close",
  protect,
  authorize("admin"),
  catchAsync(async (req, res, next) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(new AppError("Contact submission not found", 404));
    }

    contact.status = "closed";
    contact.closedAt = new Date();
    await contact.save();

    res.status(200).json({
      status: "success",
      data: {
        contact,
      },
    });
  })
);

// @desc    Get contact statistics
// @route   GET /api/contact/stats/overview
// @access  Private/Admin
router.get(
  "/stats/overview",
  protect,
  authorize("admin"),
  catchAsync(async (req, res, next) => {
    const stats = await Contact.getStats();

    res.status(200).json({
      status: "success",
      data: {
        stats: stats[0] || {},
      },
    });
  })
);

// @desc    Get unresolved contacts
// @route   GET /api/contact/unresolved/list
// @access  Private/Admin
router.get(
  "/unresolved/list",
  protect,
  authorize("admin"),
  catchAsync(async (req, res, next) => {
    const contacts = await Contact.findUnresolved();

    res.status(200).json({
      status: "success",
      results: contacts.length,
      data: {
        contacts,
      },
    });
  })
);

// @desc    Delete contact submission
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  catchAsync(async (req, res, next) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(new AppError("Contact submission not found", 404));
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  })
);

module.exports = router;
