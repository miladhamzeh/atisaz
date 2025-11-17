// routes/pollRoutes.js
const express = require('express');
const router = express.Router();
const { createPoll, getPolls, votePoll } = require('../controllers/pollController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/', requireRole('secretary','admin'), createPoll);
router.get('/', getPolls);
router.post('/:id/vote', votePoll);

module.exports = router;
