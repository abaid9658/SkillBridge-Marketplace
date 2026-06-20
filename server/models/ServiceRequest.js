const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'revision', 'completed', 'delivered', 'cancelled'],
  },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
});

const attachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  size: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Request details
    requirements: {
      type: String,
      required: [true, 'Requirements are required'],
      maxlength: [5000, 'Requirements cannot exceed 5000 characters'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [1, 'Budget must be at least $1'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    selectedPackage: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'custom'],
      default: 'basic',
    },
    // Status workflow: pending → accepted → in-progress → completed → delivered
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'revision', 'completed', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [statusHistorySchema],
    // Delivery
    deliverables: [attachmentSchema],
    deliveredAt: Date,
    completedAt: Date,
    // Payment
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentIntentId: String,
    amountPaid: { type: Number, default: 0 },
    // Revision requests
    revisionCount: { type: Number, default: 0 },
    maxRevisions: { type: Number, default: 2 },
    revisionNote: String,
    // Review
    isReviewed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
serviceRequestSchema.index({ customer: 1, status: 1 });     // customer dashboard
serviceRequestSchema.index({ provider: 1, status: 1 });     // provider dashboard
serviceRequestSchema.index({ service: 1 });
serviceRequestSchema.index({ status: 1, createdAt: -1 });   // admin stats
serviceRequestSchema.index({ paymentStatus: 1 });
serviceRequestSchema.index({ customer: 1, createdAt: -1 });
serviceRequestSchema.index({ provider: 1, createdAt: -1 });

// ─── Status transition validation ─────────────────────────────────────────────
const VALID_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['in-progress', 'cancelled'],
  'in-progress': ['revision', 'completed'],
  revision: ['in-progress', 'completed'],
  completed: ['delivered'],
  delivered: [],
  cancelled: [],
};

serviceRequestSchema.methods.canTransitionTo = function (newStatus) {
  return VALID_TRANSITIONS[this.status]?.includes(newStatus) ?? false;
};

// ─── Auto-populate statusHistory on status change ─────────────────────────────
serviceRequestSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
    if (this.status === 'delivered') this.deliveredAt = new Date();
    if (this.status === 'completed') this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
