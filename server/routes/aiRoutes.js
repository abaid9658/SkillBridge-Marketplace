const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateServiceContent, generateProposalContent } = require('../controllers/aiController');

router.use(protect);

router.post('/service-generator', generateServiceContent);
router.post('/proposal-generator', generateProposalContent);

module.exports = router;
