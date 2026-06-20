const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'escrow_hold', 'escrow_release', 'refund', 'commission', 'payout', 'subscription'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  description: {
    type: String,
    trim: true,
  },
  stripePaymentIntentId: {
    type: String,
    default: null,
  },
  stripeSessionId: {
    type: String,
    default: null,
    index: true,
  },
  stripeTransferId: {
    type: String,
    default: null,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    default: null,
  },
  relatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Compound index for efficient queries by user and date
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
