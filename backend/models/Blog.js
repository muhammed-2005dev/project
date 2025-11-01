const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  titleAr: {
    type: String,
    required: [true, 'Arabic blog title is required'],
    trim: true,
    maxlength: [200, 'Arabic title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Blog slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  excerptAr: {
    type: String,
    required: [true, 'Arabic blog excerpt is required'],
    trim: true,
    maxlength: [500, 'Arabic excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    trim: true
  },
  contentAr: {
    type: String,
    required: [true, 'Arabic blog content is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author reference is required']
  },
  category: {
    type: String,
    required: [true, 'Blog category is required'],
    enum: ['maintenance', 'repair', 'tips', 'news', 'reviews', 'guides', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featuredImage: {
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    alt: String,
    altAr: String,
    caption: String,
    captionAr: String
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
    altAr: String,
    caption: String,
    captionAr: String,
    position: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date
  },
  readTime: {
    type: Number,
    min: [1, 'Read time must be at least 1 minute']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  likes: {
    count: {
      type: Number,
      default: 0,
      min: [0, 'Likes count cannot be negative']
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  shares: {
    count: {
      type: Number,
      default: 0,
      min: [0, 'Shares count cannot be negative']
    },
    platforms: {
      facebook: { type: Number, default: 0 },
      twitter: { type: Number, default: 0 },
      linkedin: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 }
    }
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    contentAr: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Arabic comment cannot exceed 1000 characters']
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Reply cannot exceed 500 characters']
      },
      contentAr: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Arabic reply cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  seo: {
    metaTitle: String,
    metaTitleAr: String,
    metaDescription: String,
    metaDescriptionAr: String,
    keywords: [String],
    keywordsAr: [String],
    canonicalUrl: String
  },
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
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

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.isApproved).length;
});

// Virtual for total engagement
blogSchema.virtual('totalEngagement').get(function() {
  return this.views + this.likes.count + this.shares.count + this.commentCount;
});

// Virtual for reading progress
blogSchema.virtual('readingProgress').get(function() {
  // This would be calculated on the frontend based on scroll position
  return 0;
});

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ isPublic: 1 });
blogSchema.index({ isFeatured: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ language: 1 });

// Compound indexes
blogSchema.index({ status: 1, isPublic: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1, publishedAt: -1 });
blogSchema.index({ isFeatured: 1, status: 1, publishedAt: -1 });

// Pre-save middleware to generate slug
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Pre-save middleware to set published date
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Pre-save middleware to calculate read time
blogSchema.pre('save', function(next) {
  if (this.isModified('content') && this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Static method to find published posts
blogSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published', 
    isPublic: true 
  }).populate('author').sort({ publishedAt: -1 });
};

// Static method to find posts by category
blogSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    status: 'published', 
    isPublic: true 
  }).populate('author').sort({ publishedAt: -1 });
};

// Static method to find featured posts
blogSchema.statics.findFeatured = function() {
  return this.find({ 
    isFeatured: true, 
    status: 'published', 
    isPublic: true 
  }).populate('author').sort({ publishedAt: -1 });
};

// Static method to find posts by tag
blogSchema.statics.findByTag = function(tag) {
  return this.find({ 
    tags: tag.toLowerCase(), 
    status: 'published', 
    isPublic: true 
  }).populate('author').sort({ publishedAt: -1 });
};

// Static method to find related posts
blogSchema.statics.findRelated = function(postId, category, tags, limit = 5) {
  return this.find({
    _id: { $ne: postId },
    $or: [
      { category },
      { tags: { $in: tags } }
    ],
    status: 'published',
    isPublic: true
  }).populate('author').sort({ publishedAt: -1 }).limit(limit);
};

// Static method to search posts
blogSchema.statics.search = function(query) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { titleAr: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { contentAr: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    status: 'published',
    isPublic: true
  }).populate('author').sort({ publishedAt: -1 });
};

module.exports = mongoose.model('Blog', blogSchema);
