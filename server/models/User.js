const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  projectUrl: String,
  category: String,
});

const experienceSchema = new mongoose.Schema({
  company: String,
  role: String,
  from: Date,
  to: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const pricingSchema = new mongoose.Schema({
  basic: { name: String, price: Number, description: String, deliveryDays: Number },
  standard: { name: String, price: Number, description: String, deliveryDays: Number },
  premium: { name: String, price: Number, description: String, deliveryDays: Number },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer',
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'pro', 'agency'],
      default: 'free',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    location: String,
    phone: String,
    // Provider-specific fields
    skills: [{ type: String, trim: true }],
    experience: [experienceSchema],
    pricing: pricingSchema,
    portfolio: [portfolioItemSchema],
    // Stats
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    // Account status
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    // Reset password
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for high performance ───────────────────────────────────────────
// NOTE: email uniqueness is enforced by the schema field `unique: true`
// Do NOT add a duplicate userSchema.index({ email:1 }) here — it causes Mongoose to warn
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ avgRating: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, avgRating: -1 }); // compound for provider listings

// ─── Hash password before save ───────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Compare password ────────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Generate JWT ────────────────────────────────────────────────────────────
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
