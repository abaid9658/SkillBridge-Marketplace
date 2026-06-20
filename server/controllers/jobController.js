const Job = require('../models/Job');
const Proposal = require('../models/Proposal');
const { AppError } = require('../middleware/errorHandler');

// Browse jobs (public)
exports.getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, status, search, sort = 'recent' } = req.query;
    // Admin can pass status=all to get all jobs regardless of status
    const defaultStatus = 'open';
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    else if (!status) filter.status = defaultStatus;
    // Apply public filters only for non-admin requests without status=all
    if (status !== 'all') {
      filter.visibility = 'public';
      filter.expiresAt = { $gt: new Date() };
    }
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const sortMap = { recent: { createdAt: -1 }, budget_high: { 'budget.max': -1 }, budget_low: { 'budget.min': 1 } };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('customerId', 'name profilePicture avgRating totalReviews')
        .lean(),
      Job.countDocuments(filter),
    ]);

    res.json({ success: true, jobs, data: jobs, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// Get single job
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('customerId', 'name profilePicture avgRating totalReviews createdAt')
      .lean();
    if (!job) return next(new AppError('Job not found', 404));

    // Increment views
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, data: job });
  } catch (err) { next(err); }
};

// Post a job (customer only)
exports.createJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'customer') return next(new AppError('Only customers can post jobs', 403));
    const job = await Job.create({ ...req.body, customerId: req.user._id });
    res.status(201).json({ success: true, message: 'Job posted successfully', data: job });
  } catch (err) { next(err); }
};

// Edit job (owner or admin)
exports.updateJob = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? { _id: req.params.id } : { _id: req.params.id, customerId: req.user._id };
    const job = await Job.findOne(query);
    if (!job) return next(new AppError('Job not found or unauthorized', 404));
    if (!isAdmin && job.status !== 'open') return next(new AppError('Cannot edit a closed or in-progress job', 400));

    Object.assign(job, req.body);
    await job.save();
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
};

// Delete job (owner or admin)
exports.deleteJob = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? { _id: req.params.id } : { _id: req.params.id, customerId: req.user._id };
    const job = await Job.findOneAndDelete(query);
    if (!job) return next(new AppError('Job not found or unauthorized', 404));
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) { next(err); }
};

// Get customer's own jobs
exports.getMyJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { customerId: req.user._id };
    if (status) filter.status = status;

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      Job.countDocuments(filter),
    ]);

    res.json({ success: true, data: jobs, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// ── PROPOSALS ──

// Get proposals for a job (job owner only)
exports.getJobProposals = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) return next(new AppError('Job not found', 404));

    // Allow owner or admin to view proposals
    const isOwner = req.user && job.customerId.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    const isProvider = req.user && req.user.role === 'provider'; // providers see their own proposal check

    if (!isOwner && !isAdmin && !isProvider) {
      return next(new AppError('Not authorized to view proposals', 403));
    }

    const filter = isProvider && !isOwner && !isAdmin
      ? { jobId, providerId: req.user._id }
      : { jobId };

    const proposals = await Proposal.find(filter)
      .sort({ createdAt: -1 })
      .populate('providerId', 'name profilePicture avgRating totalReviews skills bio location')
      .lean();

    // Mark proposals as viewed (only for job owner)
    if (isOwner) {
      await Proposal.updateMany({ jobId, viewedAt: null }, { viewedAt: new Date() });
    }

    res.json({ success: true, data: proposals, proposals });
  } catch (err) { next(err); }
};

// Submit proposal (provider only)
exports.submitProposal = async (req, res, next) => {
  try {
    if (req.user.role !== 'provider') return next(new AppError('Only providers can submit proposals', 403));

    const job = await Job.findById(req.body.jobId);
    if (!job || job.status !== 'open') return next(new AppError('Job is not accepting proposals', 400));

    const existing = await Proposal.findOne({ jobId: req.body.jobId, providerId: req.user._id });
    if (existing) return next(new AppError('You have already submitted a proposal for this job', 400));

    const proposal = await Proposal.create({ ...req.body, providerId: req.user._id });
    await Job.findByIdAndUpdate(req.body.jobId, { $inc: { proposalCount: 1 } });

    res.status(201).json({ success: true, message: 'Proposal submitted!', data: proposal });
  } catch (err) { next(err); }
};

// Accept proposal (customer only)
exports.acceptProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('jobId');
    if (!proposal) return next(new AppError('Proposal not found', 404));
    if (proposal.jobId.customerId.toString() !== req.user._id.toString()) return next(new AppError('Unauthorized', 403));

    await Promise.all([
      Proposal.findByIdAndUpdate(req.params.id, { status: 'accepted' }),
      Proposal.updateMany({ jobId: proposal.jobId._id, _id: { $ne: req.params.id } }, { status: 'rejected' }),
      Job.findByIdAndUpdate(proposal.jobId._id, { status: 'in_progress', acceptedProposalId: proposal._id }),
    ]);

    res.json({ success: true, message: 'Proposal accepted!' });
  } catch (err) { next(err); }
};

// Reject proposal
exports.rejectProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('jobId');
    if (!proposal) return next(new AppError('Proposal not found', 404));
    if (proposal.jobId.customerId.toString() !== req.user._id.toString()) return next(new AppError('Unauthorized', 403));

    await Proposal.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.json({ success: true, message: 'Proposal rejected' });
  } catch (err) { next(err); }
};
