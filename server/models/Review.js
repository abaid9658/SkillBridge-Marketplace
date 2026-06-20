const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    // Sub-ratings
    communication: { type: Number, min: 1, max: 5 },
    serviceAsDescribed: { type: Number, min: 1, max: 5 },
    wouldRecommend: { type: Boolean, default: true },
    // Provider response
    providerResponse: {
      comment: String,
      respondedAt: Date,
    },
    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
reviewSchema.index({ provider: 1, createdAt: -1 });
reviewSchema.index({ service: 1, createdAt: -1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ rating: -1 });
// Prevent duplicate reviews per request
reviewSchema.index({ customer: 1, request: 1 }, { unique: true });

// ─── Static: Recalculate provider avg rating using aggregation ─────────────────
reviewSchema.statics.calcProviderRating = async function (providerId) {
  const stats = await this.aggregate([
    { $match: { provider: providerId } },
    {
      $group: {
        _id: '$provider',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(providerId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await mongoose.model('User').findByIdAndUpdate(providerId, {
      avgRating: 0,
      totalReviews: 0,
    });
  }
};

// ─── Static: Recalculate service avg rating ───────────────────────────────────
reviewSchema.statics.calcServiceRating = async function (serviceId) {
  const stats = await this.aggregate([
    { $match: { service: serviceId } },
    {
      $group: {
        _id: '$service',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Service').findByIdAndUpdate(serviceId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await mongoose.model('Service').findByIdAndUpdate(serviceId, {
      avgRating: 0,
      totalReviews: 0,
    });
  }
};

// ─── Recalculate after save ───────────────────────────────────────────────────
reviewSchema.post('save', async function () {
  await this.constructor.calcProviderRating(this.provider);
  await this.constructor.calcServiceRating(this.service);
});

// ─── Recalculate after delete ─────────────────────────────────────────────────
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcProviderRating(doc.provider);
    await doc.constructor.calcServiceRating(doc.service);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
