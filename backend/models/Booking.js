const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer reference is required"],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service reference is required"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "pending",
    },
    car: {
      make: {
        type: String,
        required: [true, "Car make is required"],
        trim: true,
      },
      model: {
        type: String,
        required: [true, "Car model is required"],
        trim: true,
      },
      year: {
        type: Number,
        required: [true, "Car year is required"],
      },
    },
    issue: {
      description: {
        type: String,
        required: [true, "Issue description is required"],
        trim: true,
      },
    },
    estimatedCost: {
      type: Number,
      min: [0, "Estimated cost cannot be negative"],
    },
    actualCost: {
      type: Number,
      min: [0, "Actual cost cannot be negative"],
    },
    estimatedDuration: {
      type: Number,
      min: [1, "Estimated duration must be at least 1 hour"],
    },
    actualDuration: {
      type: Number,
      min: [0, "Actual duration cannot be negative"],
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
bookingSchema.index({ customer: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ appointmentDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ technician: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
