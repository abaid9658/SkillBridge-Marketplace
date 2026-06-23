const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { sendWelcomeEmail } = require('../utils/email');

// ─── Helper: Send token response ──────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();

  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // In production (cross-origin: Vercel → Render), cookies MUST be:
    //   secure: true (HTTPS only) + sameSite: 'none' (allows cross-origin)
    // In development (same-origin), sameSite: 'lax' works fine
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      avgRating: user.avgRating,
    },
  });
};

// ─── @POST /api/auth/register ─────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Prevent admin self-registration
    if (role === 'admin') {
      return next(new AppError('Admin registration is not allowed.', 403));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered.', 400));
    }

    const user = await User.create({ name, email, password, role: role || 'customer' });

    // Non-blocking welcome email
    sendWelcomeEmail(user).catch(console.error);

    await ActivityLog.log({
      user: user._id,
      action: 'user.register',
      details: { role: user.role },
      ipAddress: req.ip,
    });

    sendTokenResponse(user, 201, res, 'Registration successful! Welcome to TEYZIX.');
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/auth/login ────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account suspended. Contact support.', 403));
    }

    // Update last seen
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

    await ActivityLog.log({
      user: user._id,
      action: 'user.login',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    sendTokenResponse(user, 200, res, 'Login successful!');
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/auth/logout ────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    await ActivityLog.log({
      user: req.user._id,
      action: 'user.logout',
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/auth/me ────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
