const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/messages/:userId', getMessages);
router.post('/messages', sendMessage);
router.get('/unread-count', getUnreadCount);

module.exports = router;
