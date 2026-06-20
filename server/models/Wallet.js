const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  escrowBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
  },
  stripeAccountId: {
    type: String,
    default: null,
  },
  stripeAccountStatus: {
    type: String,
    enum: ['pending', 'active', 'restricted', null],
    default: null,
  },
  totalEarned: {
    type: Number,
    default: 0,
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
