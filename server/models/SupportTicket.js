const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email.'],
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject.'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category.'],
      enum: ['general', 'payment', 'order', 'account', 'technical', 'dispute'],
      default: 'general',
    },
    message: {
      type: String,
      required: [true, 'Please write your message.'],
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
    },
    replyMessage: {
      type: String,
      default: null,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
