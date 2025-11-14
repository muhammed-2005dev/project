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

module.exports = {
  cloudinary,
  uploadSingle,
  uploadMultiple,
  deleteFile,
  deleteMultipleFiles
};
