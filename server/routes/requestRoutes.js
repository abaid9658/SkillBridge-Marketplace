const express = require('express');
const router = express.Router();
const { createRequest, getRequests, getRequest, updateStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createRequest);
router.get('/', getRequests);
router.get('/:id', getRequest);
router.put('/:id/status', updateStatus);

module.exports = router;
