const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bidAmount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [1, 'Bid must be at least $1'],
  },
  deliveryDays: {
    type: Number,
    required: [true, 'Delivery time is required'],
    min: [1, 'Must be at least 1 day'],
    max: [365, 'Cannot exceed 365 days'],
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    minlength: [100, 'Cover letter must be at least 100 characters'],
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
  },
  attachments: [{
    url: String,
    publicId: String,
    originalName: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    dueDate: Date,
  }],
  isBoostBid: {
    type: Boolean,
    default: false,
  },
  viewedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Indexes
proposalSchema.index({ jobId: 1, createdAt: -1 });
proposalSchema.index({ providerId: 1 });
proposalSchema.index({ jobId: 1, providerId: 1 }, { unique: true }); // one proposal per job per provider
proposalSchema.index({ status: 1 });

module.exports = mongoose.model('Proposal', proposalSchema);
