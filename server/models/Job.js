const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [3000, 'Description cannot exceed 3000 characters'],
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Website Development', 'Mobile App Development', 'Logo Design',
      'SEO & Digital Marketing', 'Content Writing', 'Video Editing',
      'Data Science & AI', 'Cybersecurity', 'UI/UX Design',
      'Social Media Management', 'Other',
    ],
  },
  skills: [{
    type: String,
    trim: true,
  }],
  budget: {
    type: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed',
    },
    min: {
      type: Number,
      min: 0,
    },
    max: {
      type: Number,
      min: 0,
    },
  },
  deadline: {
    type: Date,
  },
  attachments: [{
    url: String,
    publicId: String,
    originalName: String,
  }],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'closed'],
    default: 'open',
  },
  proposalCount: {
    type: Number,
    default: 0,
  },
  acceptedProposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    default: null,
  },
  views: {
    type: Number,
    default: 0,
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
}, { timestamps: true });

// Indexes
jobSchema.index({ customerId: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ expiresAt: 1 });
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
