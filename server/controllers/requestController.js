const ServiceRequest = require('../models/ServiceRequest');
const Service = require('../models/Service');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { sendRequestNotification, sendStatusUpdateEmail } = require('../utils/email');

// ─── @POST /api/requests ──────────────────────────────────────────────────────
exports.createRequest = async (req, res, next) => {
  try {
    const { serviceId, requirements, budget, deadline, selectedPackage } = req.body;

    const service = await Service.findById(serviceId).populate('provider');
    if (!service || service.status !== 'active') {
      return next(new AppError('Service not found or unavailable.', 404));
    }

    if (service.provider._id.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot request your own service.', 400));
    }

    const serviceRequest = await ServiceRequest.create({
      customer: req.user._id,
      service: serviceId,
      provider: service.provider._id,
      requirements,
      budget: Number(budget),
      deadline: new Date(deadline),
      selectedPackage: selectedPackage || 'basic',
      statusHistory: [{ status: 'pending' }],
    });

    // Notify provider via email (non-blocking)
    sendRequestNotification(service.provider, { ...serviceRequest.toObject(), service }).catch(console.error);

    await ActivityLog.log({
      user: req.user._id,
      action: 'request.create',
      details: { requestId: serviceRequest._id, serviceId },
    });

    res.status(201).json({ success: true, message: 'Service request submitted.', request: serviceRequest });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/requests ───────────────────────────────────────────────────────
exports.getRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter = {};
    if (req.user.role === 'customer') filter.customer = req.user._id;
    else if (req.user.role === 'provider') filter.provider = req.user._id;
    // admin sees all

    if (status) filter.status = status;

    const [requests, total] = await Promise.all([
      ServiceRequest.find(filter)
        .populate('customer', 'name profilePicture')
        .populate('provider', 'name profilePicture avgRating')
        .populate('service', 'title category price images')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ServiceRequest.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), requests });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/requests/:id ───────────────────────────────────────────────────
exports.getRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name profilePicture email')
      .populate('provider', 'name profilePicture email avgRating')
      .populate('service', 'title category price deliveryTime images');

    if (!request) return next(new AppError('Request not found.', 404));

    // Only involved parties can view
    const isInvolved =
      request.customer._id.toString() === req.user._id.toString() ||
      request.provider._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isInvolved) return next(new AppError('Not authorized to view this request.', 403));

    res.status(200).json({ success: true, request });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/requests/:id/status ───────────────────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const request = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('provider', 'name email');

    if (!request) return next(new AppError('Request not found.', 404));

    // Authorization: provider can accept/progress, customer can cancel
    const isProvider = request.provider._id.toString() === req.user._id.toString();
    const isCustomer = request.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isProvider && !isCustomer && !isAdmin) {
      return next(new AppError('Not authorized.', 403));
    }

    if (!request.canTransitionTo(status)) {
      return next(
        new AppError(`Cannot transition from '${request.status}' to '${status}'.`, 400)
      );
    }

    request.status = status;
    request.statusHistory.push({ status, changedBy: req.user._id, note });

    if (status === 'delivered') request.deliveredAt = new Date();
    if (status === 'completed') {
      request.completedAt = new Date();
      // Update provider stats
      await User.findByIdAndUpdate(request.provider._id, {
        $inc: { completedProjects: 1, totalEarnings: request.amountPaid || request.budget },
      });
      // Update service order count
      await Service.findByIdAndUpdate(request.service, { $inc: { totalOrders: 1 } });
    }

    await request.save();

    // Notify via email (non-blocking)
    const notifyUser = isProvider ? request.customer : request.provider;
    sendStatusUpdateEmail(notifyUser, request, status).catch(console.error);

    await ActivityLog.log({
      user: req.user._id,
      action: 'request.status_update',
      details: { requestId: request._id, status },
    });

    res.status(200).json({ success: true, message: `Status updated to ${status}.`, request });
  } catch (err) {
    next(err);
  }
};
