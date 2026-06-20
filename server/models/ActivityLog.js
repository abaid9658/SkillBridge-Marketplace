const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'user.register',
        'user.login',
        'user.logout',
        'user.profile_update',
        'service.create',
        'service.update',
        'service.delete',
        'request.create',
        'request.accept',
        'request.reject',
        'request.status_update',
        'request.complete',
        'review.create',
        'review.update',
        'payment.initiated',
        'payment.completed',
        'payment.failed',
        'chat.message_sent',
        'admin.user_ban',
        'admin.user_activate',
      ],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });
// TTL: auto-delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// ─── Static: Log activity ─────────────────────────────────────────────────────
activityLogSchema.statics.log = async function (data) {
  try {
    await this.create(data);
  } catch (err) {
    // Non-blocking — log error but don't crash the request
    console.error('ActivityLog error:', err.message);
  }
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
