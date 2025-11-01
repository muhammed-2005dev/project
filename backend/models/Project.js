const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  nameAr: {
    type: String,
    required: [true, 'Arabic project name is required'],
    trim: true,
    maxlength: [100, 'Arabic project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  descriptionAr: {
    type: String,
    required: [true, 'Arabic project description is required'],
    trim: true,
    maxlength: [2000, 'Arabic description cannot exceed 2000 characters']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service reference is required']
  },
  client: {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Client phone is required'],
      trim: true
    }
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
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Estimated duration is required'],
    min: [1, 'Duration must be at least 1 hour']
  },
  actualDuration: {
    type: Number,
    min: [0, 'Actual duration cannot be negative']
  },
  cost: {
    estimated: {
      type: Number,
      required: [true, 'Estimated cost is required'],
      min: [0, 'Estimated cost cannot be negative']
    },
    actual: {
      type: Number,
      min: [0, 'Actual cost cannot be negative']
    },
    labor: {
      type: Number,
      min: [0, 'Labor cost cannot be negative']
    },
    parts: {
      type: Number,
      min: [0, 'Parts cost cannot be negative']
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    caption: String,
    captionAr: String,
    type: {
      type: String,
      enum: ['before', 'during', 'after'],
      default: 'after'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  parts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    partNumber: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    supplier: String,
    warranty: {
      type: Number,
      default: 0
    },
    warrantyUnit: {
      type: String,
      enum: ['days', 'weeks', 'months', 'years'],
      default: 'months'
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  meta: {
    title: String,
    titleAr: String,
    description: String,
    descriptionAr: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total parts cost
projectSchema.virtual('totalPartsCost').get(function() {
  return this.parts.reduce((total, part) => total + (part.quantity * part.unitPrice), 0);
});

// Virtual for project duration
projectSchema.virtual('projectDuration').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'cancelled') return 0;
  if (this.status === 'pending') return 0;
  if (this.status === 'in-progress') {
    // Calculate based on actual duration vs estimated duration
    if (this.actualDuration && this.estimatedDuration) {
      return Math.min(Math.round((this.actualDuration / this.estimatedDuration) * 100), 90);
    }
    return 50; // Default for in-progress without duration data
  }
  return 0;
});

// Indexes for better query performance
projectSchema.index({ service: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ 'client.email': 1 });
projectSchema.index({ 'car.make': 1, 'car.model': 1 });
projectSchema.index({ isPublic: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ createdAt: -1 });

// Pre-save middleware to generate meta data if not provided
projectSchema.pre('save', function(next) {
  if (!this.meta.title) {
    this.meta.title = this.name;
  }
  if (!this.meta.titleAr) {
    this.meta.titleAr = this.nameAr;
  }
  if (!this.meta.description) {
    this.meta.description = this.description;
  }
  if (!this.meta.descriptionAr) {
    this.meta.descriptionAr = this.descriptionAr;
  }
  next();
});

// Pre-save middleware to set end date when status changes to completed
projectSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.endDate) {
    this.endDate = new Date();
  }
  next();
});

// Static method to find public projects
projectSchema.statics.findPublic = function() {
  return this.find({ isPublic: true }).populate('service').sort({ createdAt: -1 });
};

// Static method to find featured projects
projectSchema.statics.findFeatured = function() {
  return this.find({ isPublic: true, featured: true }).populate('service').sort({ createdAt: -1 });
};

// Static method to find projects by service
projectSchema.statics.findByService = function(serviceId) {
  return this.find({ service: serviceId, isPublic: true }).populate('service').sort({ createdAt: -1 });
};

module.exports = mongoose.model('Project', projectSchema);
