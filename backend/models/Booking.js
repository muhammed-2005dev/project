const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer reference is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service reference is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  car: {
    make: {
      type: String,
      required: [true, 'Car make is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Car model is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Car year is required'],
      min: [1900, 'Invalid car year'],
      max: [new Date().getFullYear() + 1, 'Invalid car year']
    },
    vin: {
      type: String,
      trim: true,
      uppercase: true
    },
    licensePlate: {
      type: String,
      trim: true,
      uppercase: true
    },
    mileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative']
    },
    color: String
  },
  issue: {
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      maxlength: [1000, 'Issue description cannot exceed 1000 characters']
    },
    descriptionAr: {
      type: String,
      required: [true, 'Arabic issue description is required'],
      trim: true,
      maxlength: [1000, 'Arabic issue description cannot exceed 1000 characters']
    },
    symptoms: [{
      type: String,
      trim: true
    }],
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  estimatedCost: {
    type: Number,
    min: [0, 'Estimated cost cannot be negative']
  },
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative']
  },
  estimatedDuration: {
    type: Number,
    min: [1, 'Estimated duration must be at least 1 hour']
  },
  actualDuration: {
    type: Number,
    min: [0, 'Actual duration cannot be negative']
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    textAr: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call'],
      required: true
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  followUp: {
    scheduled: {
      type: Date
    },
    completed: {
      type: Boolean,
      default: false
    },
    notes: String
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'bank-transfer', 'online'],
      default: 'cash'
    },
    amount: {
      type: Number,
      min: [0, 'Payment amount cannot be negative']
    },
    paidAt: Date,
    transactionId: String
  },
  cancellation: {
    reason: String,
    reasonAr: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    }
  },
  rating: {
    score: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    commentAr: {
      type: String,
      trim: true,
      maxlength: [500, 'Arabic comment cannot exceed 500 characters']
    },
    ratedAt: Date
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for appointment datetime
bookingSchema.virtual('appointmentDateTime').get(function() {
  const [hours, minutes] = this.appointmentTime.split(':');
  const appointmentDateTime = new Date(this.appointmentDate);
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return appointmentDateTime;
});

// Virtual for is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  return this.appointmentDateTime > new Date() && ['pending', 'confirmed'].includes(this.status);
});

// Virtual for is past
bookingSchema.virtual('isPast').get(function() {
  return this.appointmentDateTime < new Date();
});

// Virtual for can be cancelled
bookingSchema.virtual('canBeCancelled').get(function() {
  const now = new Date();
  const appointmentTime = this.appointmentDateTime;
  const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
  
  return ['pending', 'confirmed'].includes(this.status) && hoursUntilAppointment > 2;
});

// Indexes for better query performance
bookingSchema.index({ customer: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ appointmentDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ technician: 1 });
bookingSchema.index({ 'car.make': 1, 'car.model': 1 });
bookingSchema.index({ createdAt: -1 });

// Compound indexes
bookingSchema.index({ appointmentDate: 1, appointmentTime: 1 });
bookingSchema.index({ status: 1, appointmentDate: 1 });

// Pre-save middleware to validate appointment date
bookingSchema.pre('save', function(next) {
  if (this.appointmentDate < new Date()) {
    return next(new Error('Appointment date cannot be in the past'));
  }
  next();
});

// Static method to find bookings by date range
bookingSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    appointmentDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('customer service technician').sort({ appointmentDate: 1, appointmentTime: 1 });
};

// Static method to find upcoming bookings
bookingSchema.statics.findUpcoming = function() {
  return this.find({
    appointmentDate: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  }).populate('customer service technician').sort({ appointmentDate: 1, appointmentTime: 1 });
};

// Static method to find bookings by status
bookingSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('customer service technician').sort({ createdAt: -1 });
};

// Static method to find bookings by technician
bookingSchema.statics.findByTechnician = function(technicianId) {
  return this.find({ technician: technicianId }).populate('customer service').sort({ appointmentDate: -1 });
};

module.exports = mongoose.model('Booking', bookingSchema);
