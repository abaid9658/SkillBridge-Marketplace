const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  createDepositSession,
  createSubscriptionSession,
  verifyDepositSession,
  verifySubscriptionSession,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Note: /api/payments/webhook is mounted directly in server.js before JSON body parser

// Protected routes
router.post('/create-intent',               protect, createPaymentIntent);
router.post('/confirm',                     protect, confirmPayment);
router.post('/create-deposit-session',      protect, createDepositSession);
router.post('/create-subscription-session', protect, createSubscriptionSession);
router.post('/verify-deposit',              protect, verifyDepositSession);
router.post('/verify-subscription',         protect, verifySubscriptionSession);

module.exports = router;
