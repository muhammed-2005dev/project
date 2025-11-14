const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: [0, "Price cannot be negative"],
    },
    duration: {
      type: Number,
      required: [true, "Service duration is required"],
    },
    category: {
      type: String,
      required: [true, "Service category is required"],
      enum: [
        "Engine",
        "Transmission",
        "Brakes",
        "Tires",
        "Electrical",
        "AC",
        "Diagnostic",
        "Oil",
        "Other",
      ],
      default: "Other",
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        alt: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ price: 1 });

module.exports = mongoose.model("Service", serviceSchema);
