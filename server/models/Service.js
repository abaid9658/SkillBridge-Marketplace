const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Website Development',
        'Logo Design',
        'Social Media Management',
        'Content Writing',
        'Mobile App Development',
        'UI/UX Design',
        'Video Editing',
        'SEO & Digital Marketing',
        'Data Analysis',
        'AI & Machine Learning',
        'Cybersecurity',
        'DevOps & Cloud',
        'Other',
      ],
    },
    subCategory: String,
    tags: [{ type: String, trim: true, lowercase: true }],
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least $1'],
    },
    deliveryTime: {
      type: Number,
      required: [true, 'Delivery time is required'],
      min: [1, 'Delivery time must be at least 1 day'],
    },
    revisions: { type: Number, default: 1 },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    packages: {
      basic: {
        name: { type: String, default: 'Basic' },
        description: String,
        price: Number,
        deliveryDays: Number,
        revisions: { type: Number, default: 1 },
        features: [String],
      },
      standard: {
        name: { type: String, default: 'Standard' },
        description: String,
        price: Number,
        deliveryDays: Number,
        revisions: { type: Number, default: 2 },
        features: [String],
      },
      premium: {
        name: { type: String, default: 'Premium' },
        description: String,
        price: Number,
        deliveryDays: Number,
        revisions: { type: Number, default: 5 },
        features: [String],
      },
    },
    // Stats
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    // Status
    status: {
      type: String,
      enum: ['active', 'paused', 'deleted'],
      default: 'active',
    },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
serviceSchema.index({ category: 1, price: 1 });           // filter + sort by price
serviceSchema.index({ provider: 1 });                     // provider's services
serviceSchema.index({ avgRating: -1 });                   // top-rated
serviceSchema.index({ totalOrders: -1 });                 // best-selling
serviceSchema.index({ createdAt: -1 });                   // newest
serviceSchema.index({ tags: 1 });                         // tag-based search
serviceSchema.index({ category: 1, avgRating: -1 });      // compound for browsing
serviceSchema.index({ status: 1, category: 1 });          // active services by category
// Full-text search on title + description
serviceSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, description: 1 }, name: 'service_text_index' }
);

module.exports = mongoose.model('Service', serviceSchema);
