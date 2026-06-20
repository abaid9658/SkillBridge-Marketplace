const express = require('express');
const router = express.Router();
const {
  getProviders, getProvider, getProfile,
  updateProfile, changePassword, getUserStats, upgradeSubscription,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

router.get('/providers', getProviders);
router.get('/providers/:id', getProvider);

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', uploadProfile, updateProfile);
router.put('/change-password', changePassword);
router.get('/stats', getUserStats);
router.put('/subscription', upgradeSubscription);

module.exports = router;
