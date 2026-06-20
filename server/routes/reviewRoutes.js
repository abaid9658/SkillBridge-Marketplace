const express = require('express');
const router = express.Router();
const {
  createReview,
  getProviderReviews,
  getServiceReviews,
  respondToReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public routes for fetching reviews
router.get('/provider/:providerId', getProviderReviews);
router.get('/service/:serviceId', getServiceReviews);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id/respond', protect, authorize('provider'), respondToReview);

module.exports = router;
