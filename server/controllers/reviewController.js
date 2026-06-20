const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');
const AppError = require('../utils/AppError');
const ActivityLog = require('../models/ActivityLog');

// ─── @POST /api/reviews ───────────────────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const { requestId, rating, comment, communication, serviceAsDescribed, wouldRecommend } = req.body;

    // Validate the request belongs to customer and is delivered
    const request = await ServiceRequest.findById(requestId);
    if (!request) return next(new AppError('Request not found.', 404));

    if (request.customer.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the customer can leave a review.', 403));
    }

    if (!['completed', 'delivered'].includes(request.status)) {
      return next(new AppError('You can only review completed projects.', 400));
    }

    if (request.isReviewed) {
      return next(new AppError('You have already reviewed this project.', 400));
    }

    const review = await Review.create({
      customer: req.user._id,
      provider: request.provider,
      service: request.service,
      request: requestId,
      rating: Number(rating),
      comment,
      communication: communication ? Number(communication) : undefined,
      serviceAsDescribed: serviceAsDescribed ? Number(serviceAsDescribed) : undefined,
      wouldRecommend: wouldRecommend !== undefined ? Boolean(wouldRecommend) : true,
    });

    // Mark request as reviewed
    await ServiceRequest.findByIdAndUpdate(requestId, { isReviewed: true });

    await ActivityLog.log({ user: req.user._id, action: 'review.create', details: { reviewId: review._id } });

    res.status(201).json({ success: true, message: 'Review submitted. Thank you!', review });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/reviews/provider/:providerId ───────────────────────────────────
exports.getProviderReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ provider: req.params.providerId, isPublic: true })
        .populate('customer', 'name profilePicture')
        .populate('service', 'title')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments({ provider: req.params.providerId, isPublic: true }),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), reviews });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/reviews/service/:serviceId ────────────────────────────────────
exports.getServiceReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ service: req.params.serviceId, isPublic: true })
        .populate('customer', 'name profilePicture')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments({ service: req.params.serviceId, isPublic: true }),
    ]);

    res.status(200).json({ success: true, total, reviews });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/reviews/:id/respond ───────────────────────────────────────────
exports.respondToReview = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) return next(new AppError('Review not found.', 404));
    if (review.provider.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized.', 403));
    }

    review.providerResponse = { comment, respondedAt: new Date() };
    await review.save();

    res.status(200).json({ success: true, message: 'Response added.', review });
  } catch (err) {
    next(err);
  }
};
