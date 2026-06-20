const express = require('express');
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  replyToTicket,
  deleteTicket,
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/auth');

// Public route to submit ticket
router.post('/', createTicket);

// Admin-only routes
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllTickets);
router.put('/:id/reply', replyToTicket);
router.delete('/:id', deleteTicket);

module.exports = router;
