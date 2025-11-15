const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
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
  content: {
    type: String,
    required: [true, 'Blog content is required'],
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
    caption: String,
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
    caption: String,
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ isPublic: 1 });
blogSchema.index({ isFeatured: 1 });

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

// Static method to search posts
blogSchema.statics.search = function(query) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    status: 'published',
    isPublic: true
  }).populate('author').sort({ publishedAt: -1 });
};

module.exports = mongoose.model('Blog', blogSchema);
