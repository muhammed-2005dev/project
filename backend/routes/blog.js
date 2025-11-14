const express = require('express');
const { body, query } = require('express-validator');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { uploadMultiple } = require('../utils/cloudinary');
const Blog = require('../models/Blog');
const AppError = require('../utils/appError');

const router = express.Router();

// Validation rules
const blogValidation = [
  body('title').trim().notEmpty().withMessage('Blog title is required'),
  // body('titleAr').trim().notEmpty().withMessage('Arabic blog title is required'),
  body('excerpt').trim().notEmpty().withMessage('Blog excerpt is required'),
  // body('excerptAr').trim().notEmpty().withMessage('Arabic blog excerpt is required'),
  body('content').trim().notEmpty().withMessage('Blog content is required'),
  // body('contentAr').trim().notEmpty().withMessage('Arabic blog content is required'),
  body('category').isIn(['maintenance', 'repair', 'tips', 'news', 'reviews', 'guides', 'other']).withMessage('Invalid category')
];

// @desc    Get all blog posts
// @route   GET /api/blog
// @access  Public
router.get('/', [
  query('category').optional().isIn(['maintenance', 'repair', 'tips', 'news', 'reviews', 'guides', 'other']),
  query('featured').optional().isBoolean(),
  query('tag').optional().trim(),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], optionalAuth, catchAsync(async (req, res, next) => {
  const { category, featured, tag, search, page = 1, limit = 10 } = req.query;
  
  let filter = { status: 'published', isPublic: true };
  
  // Admin can see all posts
  if (req.user && req.user.role === 'admin') {
    filter = {};
  }
  
  if (category) filter.category = category;
  if (featured !== undefined) filter.isFeatured = featured === 'true';
  if (tag) filter.tags = tag.toLowerCase();

  // Pagination
  const skip = (page - 1) * limit;

  let query = Blog.find(filter)
    .populate('author', 'firstName lastName')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Search functionality
  if (search) {
    query = Blog.search(search)
      .populate('author', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit));
  }

  const posts = await query;
  const total = search ? 
    await Blog.countDocuments({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        // { titleAr: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        // { contentAr: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ],
      status: 'published',
      isPublic: true
    }) :
    await Blog.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      posts
    }
  });
}));

// @desc    Get single blog post
// @route   GET /api/blog/:id
// @access  Public
router.get('/:id', optionalAuth, catchAsync(async (req, res, next) => {
  const post = await Blog.findById(req.params.id)
    .populate('author', 'firstName lastName')
    .populate('relatedPosts', 'title titleAr slug featuredImage publishedAt');

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  // Check if post is public or user is admin
  if (!post.isPublic && (!req.user || req.user.role !== 'admin')) {
    return next(new AppError('Blog post not found', 404));
  }

  // Increment view count
  post.views += 1;
  await post.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
}));

// @desc    Get blog post by slug
// @route   GET /api/blog/slug/:slug
// @access  Public
router.get('/slug/:slug', optionalAuth, catchAsync(async (req, res, next) => {
  const post = await Blog.findOne({ slug: req.params.slug })
    .populate('author', 'firstName lastName')
    .populate('relatedPosts', 'title titleAr slug featuredImage publishedAt');

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  // Check if post is public or user is admin
  if (!post.isPublic && (!req.user || req.user.role !== 'admin')) {
    return next(new AppError('Blog post not found', 404));
  }

  // Increment view count
  post.views += 1;
  await post.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
}));

// @desc    Create new blog post
// @route   POST /api/blog
// @access  Private/Admin
router.post('/', protect, authorize('admin'), uploadMultiple('blogImages', 10), blogValidation, catchAsync(async (req, res, next) => {
  const postData = req.body;

  // Set author
  postData.author = req.user._id;

  // Add featured image if uploaded
  if (req.files && req.files.length > 0) {
    const featuredImage = req.files[0];
    postData.featuredImage = {
      url: featuredImage.path,
      publicId: featuredImage.filename,
      alt: featuredImage.originalname
    };

    // Add remaining images
    if (req.files.length > 1) {
      postData.images = req.files.slice(1).map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        alt: file.originalname,
        position: index
      }));
    }
  }

  const post = await Blog.create(postData);

  // Populate the created post
  await post.populate('author', 'firstName lastName');

  res.status(201).json({
    status: 'success',
    data: {
      post
    }
  });
}));

// @desc    Update blog post
// @route   PUT /api/blog/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), uploadMultiple('blogImages', 10), blogValidation, catchAsync(async (req, res, next) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  const postData = req.body;

  // Add new images if uploaded
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      alt: file.originalname,
      position: post.images.length + index
    }));
    postData.images = [...post.images, ...newImages];
  }

  const updatedPost = await Blog.findByIdAndUpdate(
    req.params.id,
    postData,
    { new: true, runValidators: true }
  ).populate('author', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    data: {
      post: updatedPost
    }
  });
}));

// @desc    Delete blog post
// @route   DELETE /api/blog/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  // Delete images from Cloudinary
  const { deleteMultipleFiles } = require('../utils/cloudinary');
  const publicIds = [];

  if (post.featuredImage && post.featuredImage.publicId) {
    publicIds.push(post.featuredImage.publicId);
  }

  if (post.images && post.images.length > 0) {
    publicIds.push(...post.images.map(img => img.publicId));
  }

  if (publicIds.length > 0) {
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error('Error deleting blog images:', error);
    }
  }

  await Blog.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

// @desc    Get blog categories
// @route   GET /api/blog/categories/list
// @access  Public
router.get('/categories/list', catchAsync(async (req, res, next) => {
  const categories = await Blog.distinct('category');
  
  const categoryList = await Promise.all(
    categories.map(async (category) => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      count: await Blog.countDocuments({ category, status: 'published', isPublic: true })
    }))
  );

  res.status(200).json({
    status: 'success',
    data: {
      categories: categoryList
    }
  });
}));

// @desc    Get blog tags
// @route   GET /api/blog/tags/list
// @access  Public
router.get('/tags/list', catchAsync(async (req, res, next) => {
  const tags = await Blog.distinct('tags');
  
  const tagList = await Promise.all(
    tags.map(async (tag) => ({
      value: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
      count: await Blog.countDocuments({ tags: tag, status: 'published', isPublic: true })
    }))
  );

  res.status(200).json({
    status: 'success',
    data: {
      tags: tagList
    }
  });
}));

// @desc    Get featured blog posts
// @route   GET /api/blog/featured/list
// @access  Public
router.get('/featured/list', catchAsync(async (req, res, next) => {
  const posts = await Blog.findFeatured();

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts
    }
  });
}));

// @desc    Get related blog posts
// @route   GET /api/blog/:id/related
// @access  Public
router.get('/:id/related', catchAsync(async (req, res, next) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  const relatedPosts = await Blog.findRelated(
    post._id,
    post.category,
    post.tags,
    5
  );

  res.status(200).json({
    status: 'success',
    results: relatedPosts.length,
    data: {
      posts: relatedPosts
    }
  });
}));

// @desc    Add comment to blog post
// @route   POST /api/blog/:id/comments
// @access  Private
// router.post('/:id/comments', protect, [
//   body('content').trim().notEmpty().withMessage('Comment content is required'),
//   body('contentAr').trim().notEmpty().withMessage('Arabic comment content is required')
// ], catchAsync(async (req, res, next) => {
//   const post = await Blog.findById(req.params.id);

//   if (!post) {
//     return next(new AppError('Blog post not found', 404));
//   }

//   const comment = {
//     author: req.user._id,
//     content: req.body.content,
//     contentAr: req.body.contentAr,
//     isApproved: req.user.role === 'admin' // Auto-approve admin comments
//   };

//   post.comments.push(comment);
//   await post.save();

//   // Populate the comment author
//   await post.populate('comments.author', 'firstName lastName');

//   res.status(201).json({
//     status: 'success',
//     data: {
//       post
//     }
//   });
// }));

// @desc    Like blog post
// @route   POST /api/blog/:id/like
// @access  Private
// router.post('/:id/like', protect, catchAsync(async (req, res, next) => {
//   const post = await Blog.findById(req.params.id);

//   if (!post) {
//     return next(new AppError('Blog post not found', 404));
//   }

//   // Check if user already liked
//   const alreadyLiked = post.likes.users.includes(req.user._id);
  
//   if (alreadyLiked) {
//     // Remove like
//     post.likes.users = post.likes.users.filter(
//       userId => userId.toString() !== req.user._id.toString()
//     );
//     post.likes.count = Math.max(0, post.likes.count - 1);
//   } else {
//     // Add like
//     post.likes.users.push(req.user._id);
//     post.likes.count += 1;
//   }

//   await post.save();

//   res.status(200).json({
//     status: 'success',
//     data: {
//       likes: post.likes.count,
//       userLiked: !alreadyLiked
//     }
//   });
// }));

// @desc    Update blog post status
// @route   PUT /api/blog/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), [
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
], catchAsync(async (req, res, next) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  post.status = req.body.status;
  await post.save();

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
}));

// @desc    Delete blog post image
// @route   DELETE /api/blog/:id/images/:imageId
// @access  Private/Admin
router.delete('/:id/images/:imageId', protect, authorize('admin'), catchAsync(async (req, res, next) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    return next(new AppError('Blog post not found', 404));
  }

  const image = post.images.id(req.params.imageId);
  if (!image) {
    return next(new AppError('Image not found', 404));
  }

  // Delete image from Cloudinary
  const { deleteFile } = require('../utils/cloudinary');
  try {
    await deleteFile(image.publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }

  // Remove image from post
  image.remove();
  await post.save();

  res.status(200).json({
    status: 'success',
    message: 'Image deleted successfully'
  });
}));

module.exports = router;
