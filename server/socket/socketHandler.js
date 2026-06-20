const jwt = require('jsonwebtoken');
const User = require('../models/User');

const onlineUsers = new Map(); // userId -> Set of socketId

const socketHandler = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name role profilePicture').lean();

      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 Socket connected: ${socket.user.name} (${userId})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast that user is online
    io.emit('user_status', { userId, status: 'online' });

    // Join personal user room for targeted notifications
    socket.join(userId);

    // Join room for a specific request/chat conversation
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`👥 User ${socket.user.name} joined conversation: ${conversationId}`);
    });

    // Leave room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`👥 User ${socket.user.name} left conversation: ${conversationId}`);
    });

    // Handle typing events
    socket.on('typing', ({ conversationId, receiverId }) => {
      socket.to(conversationId).emit('typing', {
        conversationId,
        senderId: userId,
        senderName: socket.user.name,
      });
    });

    socket.on('stop_typing', ({ conversationId, receiverId }) => {
      socket.to(conversationId).emit('stop_typing', {
        conversationId,
        senderId: userId,
      });
    });

    // Send chat message
    socket.on('send_message', (message) => {
      // Broadcast to room
      socket.to(message.conversationId).emit('new_message', message);
      
      // Also send direct notification if receiver is not currently in the room
      if (message.receiver) {
        socket.to(message.receiver.toString()).emit('message_notification', {
          senderId: userId,
          senderName: socket.user.name,
          content: message.content,
          conversationId: message.conversationId,
        });
      }
    });

    // Request status updates real-time update
    socket.on('update_request_status', ({ requestId, customerId, providerId, status }) => {
      const payload = { requestId, status, updatedAt: new Date() };
      // Notify both customer and provider
      socket.to(customerId.toString()).emit('request_updated', payload);
      socket.to(providerId.toString()).emit('request_updated', payload);
    });

    // Check online status of specific users
    socket.on('check_online', (userIds, callback) => {
      const statusList = {};
      if (Array.isArray(userIds)) {
        userIds.forEach((id) => {
          statusList[id] = onlineUsers.has(id.toString()) ? 'online' : 'offline';
        });
      }
      if (typeof callback === 'function') {
        callback(statusList);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name} (${userId})`);
      
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Update last seen in DB (fire & forget)
          User.findByIdAndUpdate(userId, { lastSeen: new Date() }).exec();
          // Broadcast offline status
          io.emit('user_status', { userId, status: 'offline', lastSeen: new Date() });
        }
      }
    });
  });
};

module.exports = { socketHandler, onlineUsers };
