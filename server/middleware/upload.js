const multer = require('multer');
const { profileStorage, serviceStorage } = require('../config/cloudinary');
const AppError = require('../utils/AppError');

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPG, PNG, WebP, GIF) are allowed.', 400), false);
  }
};

// Profile picture upload (single)
exports.uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).single('profilePicture');

// Service images upload (up to 5)
exports.uploadServiceImages = multer({
  storage: serviceStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
}).array('images', 5);

// Portfolio images upload (up to 10)
exports.uploadPortfolio = multer({
  storage: serviceStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
}).array('portfolio', 10);
