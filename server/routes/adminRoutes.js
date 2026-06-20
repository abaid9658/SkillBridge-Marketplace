const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers, getUserById, updateUser, toggleUserStatus, verifyUser, deleteUser,
  getAllServices, updateServiceStatus, deleteService,
  getAllOrders, updateOrderStatus,
  getAllReviews, deleteReview,
  getAllJobs, updateJob, deleteJob,
  getActivityLogs,
  getAllTransactions,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/:id/verify', verifyUser);
router.delete('/users/:id', deleteUser);

// Services
router.get('/services', getAllServices);
router.put('/services/:id/status', updateServiceStatus);
router.delete('/services/:id', deleteService);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Reviews
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Jobs
router.get('/jobs', getAllJobs);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

// Logs
router.get('/activity-logs', getActivityLogs);

// Transactions
router.get('/transactions', getAllTransactions);

module.exports = router;
