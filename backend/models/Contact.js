const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  subjectAr: {
    type: String,
    required: [true, 'Arabic subject is required'],
    trim: true,
    maxlength: [200, 'Arabic subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  messageAr: {
    type: String,
    required: [true, 'Arabic message is required'],
    trim: true,
    maxlength: [2000, 'Arabic message cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'complaint', 'suggestion', 'support', 'business', 'partnership'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responses: [{
    message: {
      type: String,
      required: true,
      trim: true
    },
    messageAr: {
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
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    }
  }],
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'social', 'walk-in'],
    default: 'website'
  },
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  ipAddress: String,
  userAgent: String,
  resolvedAt: Date,
  closedAt: Date,
  satisfaction: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Satisfaction comment cannot exceed 500 characters']
    },
    commentAr: {
      type: String,
      trim: true,
      maxlength: [500, 'Arabic satisfaction comment cannot exceed 500 characters']
    },
    ratedAt: Date
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time since submission
contactSchema.virtual('timeSince').get(function() {
  const now = new Date();
  const diffInMs = now - this.createdAt;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
});

// Virtual for is urgent
contactSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent' || this.type === 'complaint';
});

// Virtual for response time
contactSchema.virtual('responseTime').get(function() {
  if (this.responses.length > 0) {
    const firstResponse = this.responses[0];
    return Math.floor((firstResponse.createdAt - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ phone: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ type: 1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ language: 1 });

// Compound indexes
contactSchema.index({ status: 1, priority: 1 });
contactSchema.index({ type: 1, status: 1 });
contactSchema.index({ assignedTo: 1, status: 1 });

// Pre-save middleware to set priority based on type
contactSchema.pre('save', function(next) {
  if (this.type === 'complaint' && this.priority === 'medium') {
    this.priority = 'high';
  }
  next();
});

// Static method to find by status
contactSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('assignedTo').sort({ createdAt: -1 });
};

// Static method to find by priority
contactSchema.statics.findByPriority = function(priority) {
  return this.find({ priority }).populate('assignedTo').sort({ createdAt: -1 });
};

// Static method to find unresolved
contactSchema.statics.findUnresolved = function() {
  return this.find({ 
    status: { $in: ['new', 'in-progress'] } 
  }).populate('assignedTo').sort({ priority: -1, createdAt: -1 });
};

// Static method to find by assigned user
contactSchema.statics.findByAssigned = function(userId) {
  return this.find({ assignedTo: userId }).sort({ createdAt: -1 });
};

// Static method to get statistics
contactSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
      }
    }
  ]);
};

module.exports = mongoose.model('Contact', contactSchema);
