const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { cloudinary } = require('../config/cloudinary');

// ─── @GET /api/users/providers ────────────────────────────────────────────────
exports.getProviders = async (req, res, next) => {
  try {
    const { skill, minRating, sort = '-avgRating', page = 1, limit = 12 } = req.query;

    const filter = { role: 'provider', isActive: true };
    if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
    if (minRating) filter.avgRating = { $gte: Number(minRating) };

    const skip = (Number(page) - 1) * Number(limit);

    const [providers, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetPasswordToken -resetPasswordExpire')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      providers,
    });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/users/providers/:id ───────────────────────────────────────────
exports.getProvider = async (req, res, next) => {
  try {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .lean();

    if (!provider) return next(new AppError('Provider not found.', 404));

    res.status(200).json({ success: true, provider });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/users/profile ─────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpire');
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/users/profile ─────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'bio', 'location', 'phone', 'skills', 'experience', 'pricing', 'portfolio'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Handle profile picture upload
    if (req.file) {
      updates.profilePicture = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    await ActivityLog.log({ user: req.user._id, action: 'user.profile_update' });

    res.status(200).json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/users/change-password ─────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return next(new AppError('Current password is incorrect.', 400));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/users/stats ────────────────────────────────────────────────────
exports.getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('avgRating totalReviews totalEarnings completedProjects role');
    res.status(200).json({ success: true, stats: user });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/users/subscription ─────────────────────────────────────────────
exports.upgradeSubscription = async (req, res, next) => {
  try {
    const { tier } = req.body;
    if (!['free', 'pro', 'agency'].includes(tier)) {
      return next(new AppError('Invalid subscription tier.', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subscriptionTier: tier },
      { new: true, runValidators: true }
    ).select('-password');

    await ActivityLog.log({ user: req.user._id, action: 'user.subscription_update', details: { tier } });

    res.status(200).json({
      success: true,
      message: `Successfully updated subscription to ${tier}`,
      user
    });
  } catch (err) {
    next(err);
  }
};

