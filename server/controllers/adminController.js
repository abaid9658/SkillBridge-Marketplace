const User = require('../models/User');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Job = require('../models/Job');
const Proposal = require('../models/Proposal');
const ActivityLog = require('../models/ActivityLog');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');

// ─── @GET /api/admin/stats ────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalProviders, totalCustomers, bannedUsers,
      totalServices, activeServices, pendingServices,
      totalRequests, completedRequests, pendingRequests, cancelledRequests,
      totalReviews,
      totalJobs, openJobs,
      recentUsers, recentRequests,
      earningsData,
      subEarningsData,
      revenueByMonth,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'provider' }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ isActive: false }),
      Service.countDocuments({ status: { $ne: 'deleted' } }),
      Service.countDocuments({ status: 'active' }),
      Service.countDocuments({ status: 'pending' }),
      ServiceRequest.countDocuments(),
      ServiceRequest.countDocuments({ status: 'delivered' }),
      ServiceRequest.countDocuments({ status: 'pending' }),
      ServiceRequest.countDocuments({ status: 'cancelled' }),
      Review.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      User.find().sort('-createdAt').limit(6).select('name email role createdAt profilePicture isActive isVerified').lean(),
      ServiceRequest.find().sort('-createdAt').limit(6)
        .populate('customer', 'name profilePicture')
        .populate('service', 'title category price')
        .lean(),
      ServiceRequest.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'subscription', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      ServiceRequest.aggregate([
        { $match: { status: 'delivered', createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
        { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$amountPaid' }, orders: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    const serviceRevenue = earningsData[0]?.total || 0;
    const subscriptionRevenue = subEarningsData[0]?.total || 0;
    const totalRevenue = serviceRevenue + subscriptionRevenue;

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, providers: totalProviders, customers: totalCustomers, banned: bannedUsers },
        services: { total: totalServices, active: activeServices, pending: pendingServices },
        requests: { total: totalRequests, completed: completedRequests, pending: pendingRequests, cancelled: cancelledRequests },
        reviews: { total: totalReviews },
        jobs: { total: totalJobs, open: openJobs },
        revenue: { total: totalRevenue },
        revenueByMonth,
        recent: { users: recentUsers, requests: recentRequests },
      },
    });
  } catch (err) { next(err); }
};

// ─── @GET /api/admin/users ────────────────────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetPasswordToken -resetPasswordExpire')
        .sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), users });
  } catch (err) { next(err); }
};

// ─── @GET /api/admin/users/:id ───────────────────────────────────────────────
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire').lean();
    if (!user) return next(new AppError('User not found.', 404));
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

// ─── @PUT /api/admin/users/:id ───────────────────────────────────────────────
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, bio, location, isVerified, subscriptionTier } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));

    if (name) user.name = name;
    if (email) user.email = email;
    if (role && user._id.toString() !== req.user._id.toString()) user.role = role; // can't change own role
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (subscriptionTier !== undefined) user.subscriptionTier = subscriptionTier;

    await user.save();
    await ActivityLog.log({ user: req.user._id, action: 'admin.user_update', details: { targetUserId: user._id } });
    res.status(200).json({ success: true, message: 'User updated.', user });
  } catch (err) { next(err); }
};

// ─── @PUT /api/admin/users/:id/status ────────────────────────────────────────
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));
    if (user.role === 'admin') return next(new AppError('Cannot modify admin status.', 403));

    user.isActive = !user.isActive;
    await user.save();
    await ActivityLog.log({
      user: req.user._id,
      action: user.isActive ? 'admin.user_activate' : 'admin.user_ban',
      details: { targetUserId: user._id },
    });

    res.status(200).json({ success: true, message: `User ${user.isActive ? 'activated' : 'banned'} successfully.` });
  } catch (err) { next(err); }
};

// ─── @PUT /api/admin/users/:id/verify ────────────────────────────────────────
exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!user) return next(new AppError('User not found.', 404));
    await ActivityLog.log({ user: req.user._id, action: 'admin.user_verify', details: { targetUserId: user._id } });
    res.status(200).json({ success: true, message: 'User verified.', user });
  } catch (err) { next(err); }
};

// ─── @DELETE /api/admin/users/:id ────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));
    if (user.role === 'admin') return next(new AppError('Cannot delete admin.', 403));
    await User.findByIdAndDelete(req.params.id);
    await ActivityLog.log({ user: req.user._id, action: 'admin.user_delete', details: { targetUserId: req.params.id } });
    res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (err) { next(err); }
};

// ─── @GET /api/admin/services ─────────────────────────────────────────────────
exports.getAllServices = async (req, res, next) => {
  try {
    const { status, search, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [services, total] = await Promise.all([
      Service.find(filter).populate('provider', 'name email profilePicture isVerified')
        .sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      Service.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), services });
  } catch (err) { next(err); }
};

// ─── @PUT /api/admin/services/:id/status ─────────────────────────────────────
exports.updateServiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const service = await Service.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!service) return next(new AppError('Service not found.', 404));
    await ActivityLog.log({ user: req.user._id, action: `admin.service_${status}`, details: { serviceId: service._id } });
    res.status(200).json({ success: true, message: `Service ${status}.`, service });
  } catch (err) { next(err); }
};

// ─── @DELETE /api/admin/services/:id ─────────────────────────────────────────
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { status: 'deleted' }, { new: true });
    if (!service) return next(new AppError('Service not found.', 404));
    await ActivityLog.log({ user: req.user._id, action: 'admin.service_delete', details: { serviceId: req.params.id } });
    res.status(200).json({ success: true, message: 'Service removed from platform.' });
  } catch (err) { next(err); }
};

// ─── @GET /api/admin/orders ───────────────────────────────────────────────────
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      ServiceRequest.find(filter)
        .populate('customer', 'name email profilePicture')
        .populate('provider', 'name email profilePicture')
        .populate('service', 'title category price images')
        .sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      ServiceRequest.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), orders });
  } catch (err) { next(err); }
};

// ─── @PUT /api/admin/orders/:id/status ───────────────────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await ServiceRequest.findById(req.params.id);
    if (!order) return next(new AppError('Order not found.', 404));

    order.status = status;
    order.statusHistory.push({ status, changedBy: req.user._id, note: 'Admin override' });
    await order.save();
    await ActivityLog.log({ user: req.user._id, action: 'admin.order_status_update', details: { orderId: order._id, status } });
    res.status(200).json({ success: true, message: `Order status updated to ${status}.`, order });
  } catch (err) { next(err); }
};

// ─── @GET /api/admin/reviews ──────────────────────────────────────────────────
exports.getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find()
        .populate('customer', 'name email profilePicture')
        .populate('provider', 'name email')
        .populate('service', 'title')
        .sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      Review.countDocuments(),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), reviews });
  } catch (err) { next(err); }
};

// ─── @DELETE /api/admin/reviews/:id ──────────────────────────────────────────
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return next(new AppError('Review not found.', 404));
    await ActivityLog.log({ user: req.user._id, action: 'admin.review_delete', details: { reviewId: req.params.id } });
    res.status(200).json({ success: true, message: 'Review removed.' });
  } catch (err) { next(err); }
};

// ─── @GET /api/admin/jobs ─────────────────────────────────────────────────────
exports.getAllJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status && status !== 'all' ? { status } : {};

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('customerId', 'name email profilePicture')
        .sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), jobs });
  } catch (err) { next(err); }
};

// ─── @PUT /api/admin/jobs/:id ─────────────────────────────────────────────────
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return next(new AppError('Job not found.', 404));
    await ActivityLog.log({ user: req.user._id, action: 'admin.job_update', details: { jobId: job._id } });
    res.status(200).json({ success: true, message: 'Job updated.', job });
  } catch (err) { next(err); }
};

// ─── @DELETE /api/admin/jobs/:id ──────────────────────────────────────────────
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return next(new AppError('Job not found.', 404));
    await ActivityLog.log({ user: req.user._id, action: 'admin.job_delete', details: { jobId: req.params.id } });
    res.status(200).json({ success: true, message: 'Job deleted.' });
  } catch (err) { next(err); }
};

// ─── @GET /api/admin/activity-logs ───────────────────────────────────────────
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find()
        .populate('user', 'name email role')
        .sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      ActivityLog.countDocuments(),
    ]);

    res.status(200).json({ success: true, total, logs });
  } catch (err) { next(err); }
};

// ─── @GET /api/admin/transactions ─────────────────────────────────────────────
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('userId', 'name email role')
        .populate('orderId', 'title')
        .populate('relatedUserId', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      transactions,
    });
  } catch (err) { next(err); }
};
