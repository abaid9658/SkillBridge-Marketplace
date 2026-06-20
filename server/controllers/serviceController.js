const Service = require('../models/Service');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');

// ─── @GET /api/services ───────────────────────────────────────────────────────
exports.getServices = async (req, res, next) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      minRating, sort = '-createdAt',
      page = 1, limit = 12,
    } = req.query;

    const filter = { status: 'active' };

    // Full-text search
    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.avgRating = { $gte: Number(minRating) };

    const skip = (Number(page) - 1) * Number(limit);

    let query = Service.find(filter)
      .populate('provider', 'name profilePicture avgRating totalReviews location')
      .sort(search ? { score: { $meta: 'textScore' }, ...parseSortString(sort) } : parseSortString(sort))
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const [services, total] = await Promise.all([query, Service.countDocuments(filter)]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      services,
    });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/services/:id ───────────────────────────────────────────────────
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name profilePicture bio avgRating totalReviews skills location completedProjects');

    if (!service || service.status === 'deleted') {
      return next(new AppError('Service not found.', 404));
    }

    // Increment view count (fire and forget)
    Service.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    res.status(200).json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/services ─────────────────────────────────────────────────────
exports.createService = async (req, res, next) => {
  try {
    const { title, description, category, price, deliveryTime, revisions, tags, packages } = req.body;

    // Limit service creation if free tier has 5 or more services
    if (req.user.subscriptionTier === 'free') {
      const Service = require('../models/Service');
      const serviceCount = await Service.countDocuments({ provider: req.user._id });
      if (serviceCount >= 5) {
        return res.status(403).json({
          success: false,
          message: 'Starter plan limits you to a maximum of 5 service listings. Please upgrade to Pro or Agency on the pricing page.'
        });
      }
    }

    const images = req.files?.map((f) => ({ url: f.path, publicId: f.filename })) || [];

    const service = await Service.create({
      provider: req.user._id,
      title, description, category, price: Number(price),
      deliveryTime: Number(deliveryTime),
      revisions: Number(revisions) || 1,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
      packages: packages ? JSON.parse(packages) : undefined,
      images,
    });

    await ActivityLog.log({ user: req.user._id, action: 'service.create', details: { serviceId: service._id } });

    res.status(201).json({ success: true, message: 'Service created successfully.', service });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/services/:id ───────────────────────────────────────────────────
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) return next(new AppError('Service not found.', 404));

    if (service.provider.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to update this service.', 403));
    }

    const allowed = ['title', 'description', 'category', 'price', 'deliveryTime', 'revisions', 'tags', 'packages', 'status'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (req.files?.length) {
      updates.images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    }

    service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    await ActivityLog.log({ user: req.user._id, action: 'service.update', details: { serviceId: service._id } });

    res.status(200).json({ success: true, message: 'Service updated.', service });
  } catch (err) {
    next(err);
  }
};

// ─── @DELETE /api/services/:id ────────────────────────────────────────────────
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return next(new AppError('Service not found.', 404));

    const isOwner = service.provider.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new AppError('Not authorized to delete this service.', 403));
    }

    // Soft delete
    await Service.findByIdAndUpdate(req.params.id, { status: 'deleted' });

    await ActivityLog.log({ user: req.user._id, action: 'service.delete', details: { serviceId: req.params.id } });

    res.status(200).json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/services/my-services ──────────────────────────────────────────
exports.getMyServices = async (req, res, next) => {
  try {
    const services = await Service.find({ provider: req.user._id, status: { $ne: 'deleted' } })
      .sort('-createdAt').lean();
    res.status(200).json({ success: true, services });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/services/categories ───────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Service.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function parseSortString(sort) {
  const result = {};
  sort.split(',').forEach((s) => {
    if (s.startsWith('-')) result[s.slice(1)] = -1;
    else result[s] = 1;
  });
  return result;
}
