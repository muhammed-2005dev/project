const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { 
  uploadSingle, 
  uploadMultiple, 
  uploadFields,
  deleteFile,
  deleteMultipleFiles,
  generateResponsiveUrls
} = require('../utils/cloudinary');
const AppError = require('../utils/appError');

const router = express.Router();

// @desc    Upload single file
// @route   POST /api/upload/single/:type
// @access  Private
router.post('/single/:type', protect, catchAsync(async (req, res, next) => {
  const { type } = req.params;
  
  // Validate upload type
  const validTypes = ['profileImage', 'serviceImages', 'projectImages', 'blogImages', 'reviewImages', 'contactAttachments'];
  if (!validTypes.includes(type)) {
    return next(new AppError('Invalid upload type', 400));
  }

  // Check authorization for certain types
  if (['serviceImages', 'projectImages', 'blogImages'].includes(type) && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  const upload = uploadSingle(type);
  
  upload(req, res, (err) => {
    if (err) {
      return next(new AppError(err.message, 400));
    }

    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    // Generate responsive URLs
    const responsiveUrls = generateResponsiveUrls(req.file.filename);

    res.status(200).json({
      status: 'success',
      data: {
        file: {
          url: req.file.path,
          publicId: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          responsiveUrls
        }
      }
    });
  });
}));

// @desc    Upload multiple files
// @route   POST /api/upload/multiple/:type
// @access  Private
router.post('/multiple/:type', protect, catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const { maxCount = 10 } = req.query;
  
  // Validate upload type
  const validTypes = ['serviceImages', 'projectImages', 'blogImages', 'reviewImages', 'contactAttachments'];
  if (!validTypes.includes(type)) {
    return next(new AppError('Invalid upload type', 400));
  }

  // Check authorization for certain types
  if (['serviceImages', 'projectImages', 'blogImages'].includes(type) && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  const upload = uploadMultiple(type, parseInt(maxCount));
  
  upload(req, res, (err) => {
    if (err) {
      return next(new AppError(err.message, 400));
    }

    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    // Generate responsive URLs for each file
    const files = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      responsiveUrls: generateResponsiveUrls(file.filename)
    }));

    res.status(200).json({
      status: 'success',
      results: files.length,
      data: {
        files
      }
    });
  });
}));

// @desc    Upload fields
// @route   POST /api/upload/fields/:type
// @access  Private
router.post('/fields/:type', protect, catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const { fields } = req.body;
  
  // Validate upload type
  const validTypes = ['blogImages', 'projectImages'];
  if (!validTypes.includes(type)) {
    return next(new AppError('Invalid upload type', 400));
  }

  // Check authorization
  if (req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  if (!fields || !Array.isArray(fields)) {
    return next(new AppError('Fields configuration is required', 400));
  }

  const upload = uploadFields(type, fields);
  
  upload(req, res, (err) => {
    if (err) {
      return next(new AppError(err.message, 400));
    }

    const uploadedFiles = {};
    
    // Process uploaded files by field
    Object.keys(req.files).forEach(fieldName => {
      const files = req.files[fieldName];
      uploadedFiles[fieldName] = files.map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        responsiveUrls: generateResponsiveUrls(file.filename)
      }));
    });

    res.status(200).json({
      status: 'success',
      data: {
        files: uploadedFiles
      }
    });
  });
}));

// @desc    Delete single file
// @route   DELETE /api/upload/:publicId
// @access  Private
router.delete('/:publicId', protect, catchAsync(async (req, res, next) => {
  const { publicId } = req.params;

  try {
    const result = await deleteFile(publicId);
    
    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully',
      data: {
        result
      }
    });
  } catch (error) {
    return next(new AppError('Failed to delete file', 500));
  }
}));

// @desc    Delete multiple files
// @route   DELETE /api/upload/multiple
// @access  Private
router.delete('/multiple', protect, catchAsync(async (req, res, next) => {
  const { publicIds } = req.body;

  if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
    return next(new AppError('Public IDs array is required', 400));
  }

  try {
    const result = await deleteMultipleFiles(publicIds);
    
    res.status(200).json({
      status: 'success',
      message: 'Files deleted successfully',
      data: {
        result
      }
    });
  } catch (error) {
    return next(new AppError('Failed to delete files', 500));
  }
}));

// @desc    Get file info
// @route   GET /api/upload/info/:publicId
// @access  Private
router.get('/info/:publicId', protect, catchAsync(async (req, res, next) => {
  const { publicId } = req.params;

  try {
    const { getFileInfo } = require('../utils/cloudinary');
    const fileInfo = await getFileInfo(publicId);
    
    res.status(200).json({
      status: 'success',
      data: {
        fileInfo
      }
    });
  } catch (error) {
    return next(new AppError('Failed to get file info', 500));
  }
}));

// @desc    Generate responsive URLs
// @route   POST /api/upload/responsive-urls
// @access  Private
router.post('/responsive-urls', protect, catchAsync(async (req, res, next) => {
  const { publicId } = req.body;

  if (!publicId) {
    return next(new AppError('Public ID is required', 400));
  }

  try {
    const responsiveUrls = generateResponsiveUrls(publicId);
    
    res.status(200).json({
      status: 'success',
      data: {
        responsiveUrls
      }
    });
  } catch (error) {
    return next(new AppError('Failed to generate responsive URLs', 500));
  }
}));

// @desc    Get upload limits and allowed types
// @route   GET /api/upload/config
// @access  Public
router.get('/config', catchAsync(async (req, res, next) => {
  const config = {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
    uploadTypes: {
      profileImage: {
        maxFiles: 1,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 5 * 1024 * 1024 // 5MB
      },
      serviceImages: {
        maxFiles: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 10 * 1024 * 1024 // 10MB
      },
      projectImages: {
        maxFiles: 10,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 10 * 1024 * 1024 // 10MB
      },
      blogImages: {
        maxFiles: 10,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 10 * 1024 * 1024 // 10MB
      },
      reviewImages: {
        maxFiles: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 5 * 1024 * 1024 // 5MB
      },
      contactAttachments: {
        maxFiles: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxSize: 10 * 1024 * 1024 // 10MB
      }
    }
  };

  res.status(200).json({
    status: 'success',
    data: {
      config
    }
  });
}));

module.exports = router;
