const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const wc = require('../controllers/walletController');

router.use(protect);
router.get('/', wc.getWallet);
router.get('/transactions', wc.getTransactions);
router.post('/deposit', wc.deposit);
router.post('/withdraw', wc.withdraw);

module.exports = router;
