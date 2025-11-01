const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  rating: {
    overall: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    quality: {
      type: Number,
      min: [1, 'Quality rating must be at least 1'],
      max: [5, 'Quality rating cannot exceed 5']
    },
    timeliness: {
      type: Number,
      min: [1, 'Timeliness rating must be at least 1'],
      max: [5, 'Timeliness rating cannot exceed 5']
    },
    communication: {
      type: Number,
      min: [1, 'Communication rating must be at least 1'],
      max: [5, 'Communication rating cannot exceed 5']
    },
    value: {
      type: Number,
      min: [1, 'Value rating must be at least 1'],
      max: [5, 'Value rating cannot exceed 5']
    }
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  commentAr: {
    type: String,
    trim: true,
    maxlength: [1000, 'Arabic comment cannot exceed 1000 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [200, 'Pro cannot exceed 200 characters']
  }],
  prosAr: [{
    type: String,
    trim: true,
    maxlength: [200, 'Arabic pro cannot exceed 200 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [200, 'Con cannot exceed 200 characters']
  }],
  consAr: [{
    type: String,
    trim: true,
    maxlength: [200, 'Arabic con cannot exceed 200 characters']
  }],
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
    captionAr: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative']
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    text: {
      type: String,
      trim: true,
      maxlength: [1000, 'Response cannot exceed 1000 characters']
    },
    textAr: {
      type: String,
      trim: true,
      maxlength: [1000, 'Arabic response cannot exceed 1000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderation: {
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    reason: String,
    notes: String
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
reviewSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.rating.overall,
    this.rating.quality,
    this.rating.timeliness,
    this.rating.communication,
    this.rating.value
  ].filter(rating => rating !== undefined);
  
  if (ratings.length === 0) return 0;
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Virtual for star display
reviewSchema.virtual('stars').get(function() {
  return '★'.repeat(Math.floor(this.rating.overall)) + '☆'.repeat(5 - Math.floor(this.rating.overall));
});

// Virtual for time since review
reviewSchema.virtual('timeSince').get(function() {
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

// Indexes for better query performance
reviewSchema.index({ customer: 1 });
reviewSchema.index({ service: 1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ isPublic: 1 });
reviewSchema.index({ isVerified: 1 });
reviewSchema.index({ isFeatured: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ language: 1 });

// Compound indexes
reviewSchema.index({ service: 1, isPublic: 1, status: 1 });
reviewSchema.index({ service: 1, 'rating.overall': -1 });

// Pre-save middleware to calculate average rating
reviewSchema.pre('save', function(next) {
  // Auto-approve reviews with rating 4 or higher
  if (this.rating.overall >= 4 && this.status === 'pending') {
    this.status = 'approved';
  }
  next();
});

// Static method to find public reviews
reviewSchema.statics.findPublic = function() {
  return this.find({ isPublic: true, status: 'approved' }).populate('customer service').sort({ createdAt: -1 });
};

// Static method to find reviews by service
reviewSchema.statics.findByService = function(serviceId) {
  return this.find({ 
    service: serviceId, 
    isPublic: true, 
    status: 'approved' 
  }).populate('customer').sort({ createdAt: -1 });
};

// Static method to find featured reviews
reviewSchema.statics.findFeatured = function() {
  return this.find({ 
    isPublic: true, 
    isFeatured: true, 
    status: 'approved' 
  }).populate('customer service').sort({ createdAt: -1 });
};

// Static method to find reviews by rating
reviewSchema.statics.findByRating = function(minRating = 1, maxRating = 5) {
  return this.find({ 
    'rating.overall': { $gte: minRating, $lte: maxRating },
    isPublic: true, 
    status: 'approved' 
  }).populate('customer service').sort({ 'rating.overall': -1 });
};

// Static method to get service statistics
reviewSchema.statics.getServiceStats = function(serviceId) {
  return this.aggregate([
    { $match: { service: mongoose.Types.ObjectId(serviceId), isPublic: true, status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating.overall' },
        ratingDistribution: {
          $push: '$rating.overall'
        }
      }
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingDistribution: {
          $reduce: {
            input: '$ratingDistribution',
            initialValue: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{ k: { $toString: '$$this' }, v: { $add: [{ $getField: { field: { $toString: '$$this' }, input: '$$value' } }, 1] } }]
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Review', reviewSchema);
