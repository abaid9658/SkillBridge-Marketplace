const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    attachment: {
      name: String,
      url: String,
      type: String,
      size: Number,
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });   // unread count
messageSchema.index({ request: 1, createdAt: 1 });

// ─── Static: Generate consistent conversationId ────────────────────────────────
messageSchema.statics.getConversationId = function (userId1, userId2) {
  const sorted = [userId1.toString(), userId2.toString()].sort();
  return sorted.join('_');
};

// ─── Mark as read ─────────────────────────────────────────────────────────────
messageSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Message', messageSchema);
