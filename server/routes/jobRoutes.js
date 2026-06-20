const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const jc = require('../controllers/jobController');

// ── Public ──────────────────────────────────────────────────────────────────
router.get('/', jc.getJobs);
router.get('/:id/proposals', protect, jc.getJobProposals); // must be before /:id
router.get('/:id', jc.getJob);

// ── Protected ────────────────────────────────────────────────────────────────
router.post('/', protect, jc.createJob);
router.get('/me/list', protect, jc.getMyJobs);   // note: must come before /:id — handled above
router.put('/:id', protect, jc.updateJob);
router.delete('/:id', protect, jc.deleteJob);

// ── Proposal actions ─────────────────────────────────────────────────────────
router.post('/proposals/submit', protect, jc.submitProposal);
router.put('/proposals/:id/accept', protect, jc.acceptProposal);
router.put('/proposals/:id/reject', protect, jc.rejectProposal);

module.exports = router;
