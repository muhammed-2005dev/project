const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Cloudinary storage
const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: allowedFormats,
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    }
  });
};

// Multer configuration for different upload types
const uploadConfigs = {
  // User profile images
  profileImage: multer({
    storage: createCloudinaryStorage('autologic/users'),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
      }
    }
  }),

  // Service images
  serviceImages: multer({
    storage: createCloudinaryStorage('autologic/services'),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
      }
    }
  }),

  // Project images
  projectImages: multer({
    storage: createCloudinaryStorage('autologic/projects'),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
      }
    }
  }),

  // Blog images
  blogImages: multer({
    storage: createCloudinaryStorage('autologic/blog'),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
      }
    }
  }),

  // Review images
  reviewImages: multer({
    storage: createCloudinaryStorage('autologic/reviews'),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
      }
    }
  }),

  // Contact attachments
  contactAttachments: multer({
    storage: createCloudinaryStorage('autologic/contacts'),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = 'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'.split(',');
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type.'), false);
      }
    }
  })
};

// Upload single file
const uploadSingle = (uploadType) => {
  return uploadConfigs[uploadType].single('file');
};

// Upload multiple files
const uploadMultiple = (uploadType, maxCount = 10) => {
  return uploadConfigs[uploadType].array('files', maxCount);
};

// Upload fields
const uploadFields = (uploadType, fields) => {
  return uploadConfigs[uploadType].fields(fields);
};

// Delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw new Error('Failed to delete file');
  }
};

// Delete multiple files from Cloudinary
const deleteMultipleFiles = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Error deleting multiple files from Cloudinary:', error);
    throw new Error('Failed to delete files');
  }
};

// Get file info
const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw new Error('Failed to get file info');
  }
};

// Transform image
const transformImage = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, transformations);
};

// Generate responsive image URLs
const generateResponsiveUrls = (publicId) => {
  return {
    thumbnail: cloudinary.url(publicId, { width: 150, height: 150, crop: 'fill', quality: 'auto' }),
    small: cloudinary.url(publicId, { width: 300, height: 200, crop: 'fill', quality: 'auto' }),
    medium: cloudinary.url(publicId, { width: 600, height: 400, crop: 'fill', quality: 'auto' }),
    large: cloudinary.url(publicId, { width: 1200, height: 800, crop: 'limit', quality: 'auto' }),
    original: cloudinary.url(publicId, { quality: 'auto' })
  };
};

module.exports = {
  cloudinary,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  deleteMultipleFiles,
  getFileInfo,
  transformImage,
  generateResponsiveUrls
};
