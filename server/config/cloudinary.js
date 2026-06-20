const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile pictures
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'teyzix/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
  },
});

// Storage for portfolio / service images
const serviceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'teyzix/services',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 800, crop: 'fill' }],
  },
});

module.exports = { cloudinary, profileStorage, serviceStorage };
