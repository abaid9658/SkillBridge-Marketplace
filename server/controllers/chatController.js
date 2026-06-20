const Message = require('../models/Message');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// ─── @GET /api/chat/conversations ────────────────────────────────────────────
exports.getConversations = async (req, res, next) => {
  try {
    // Get all unique conversations for the user
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
          isDeleted: false,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$isRead', false] }, { $eq: ['$receiver', req.user._id] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    // Populate the other user's info
    const conversations = await Promise.all(
      messages.map(async (conv) => {
        const otherUserId = conv.lastMessage.sender.toString() === req.user._id.toString()
          ? conv.lastMessage.receiver
          : conv.lastMessage.sender;

        const otherUser = await User.findById(otherUserId)
          .select('name profilePicture lastSeen role')
          .lean();

        return {
          conversationId: conv._id,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          otherUser,
        };
      })
    );

    res.status(200).json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/chat/messages/:userId ─────────────────────────────────────────
exports.getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const conversationId = Message.getConversationId(req.user._id, req.params.userId);

    const messages = await Message.find({ conversationId, isDeleted: false })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('sender', 'name profilePicture')
      .lean();

    // Mark all as read
    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({ success: true, messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/chat/messages ─────────────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, requestId } = req.body;

    const receiver = await User.findById(receiverId);
    if (!receiver) return next(new AppError('Receiver not found.', 404));

    const conversationId = Message.getConversationId(req.user._id, receiverId);

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      conversationId,
      request: requestId || undefined,
    });

    await message.populate('sender', 'name profilePicture');

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/chat/unread-count ──────────────────────────────────────────────
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.status(200).json({ success: true, count });
  } catch (err) {
    next(err);
  }
};
