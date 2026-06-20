const express = require('express');
const router = express.Router();
const {
  getServices, getService, createService,
  updateService, deleteService, getMyServices, getCategories,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { uploadServiceImages } = require('../middleware/upload');

// Public routes
router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/my-services', protect, authorize('provider'), getMyServices);
router.get('/:id', getService);

// Provider routes
router.post('/', protect, authorize('provider'), uploadServiceImages, createService);
router.put('/:id', protect, authorize('provider', 'admin'), uploadServiceImages, updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
