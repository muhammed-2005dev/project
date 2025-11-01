const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  nameAr: {
    type: String,
    required: [true, 'Arabic service name is required'],
    trim: true,
    maxlength: [100, 'Arabic service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  descriptionAr: {
    type: String,
    required: [true, 'Arabic service description is required'],
    trim: true,
    maxlength: [1000, 'Arabic description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceAr: {
    type: String,
    required: [true, 'Arabic price is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Service duration is required'],
    trim: true
  },
  durationAr: {
    type: String,
    required: [true, 'Arabic duration is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['Engine', 'Transmission', 'Brakes', 'Tires', 'Electrical', 'AC', 'Diagnostic', 'Oil', 'Other'],
    default: 'Other'
  },
  categoryAr: {
    type: String,
    required: [true, 'Arabic category is required'],
    trim: true
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
    alt: String,
    altAr: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    nameAr: {
      type: String,
      required: true
    },
    included: {
      type: Boolean,
      default: true
    }
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  warranty: {
    type: Number,
    default: 0,
    min: [0, 'Warranty cannot be negative']
  },
  warrantyUnit: {
    type: String,
    enum: ['days', 'weeks', 'months', 'years'],
    default: 'months'
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

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for formatted duration
serviceSchema.virtual('formattedDuration').get(function() {
  if (this.duration < 60) {
    return `${this.duration} minutes`;
  } else {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
  }
});

// Indexes for better query performance
serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ isPopular: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ tags: 1 });

// Pre-save middleware to generate meta data if not provided
serviceSchema.pre('save', function(next) {
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

// Static method to find active services
serviceSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to find popular services
serviceSchema.statics.findPopular = function() {
  return this.find({ isActive: true, isPopular: true }).sort({ createdAt: -1 });
};

// Static method to find services by category
serviceSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Service', serviceSchema);
