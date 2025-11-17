// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { getNotifications, markRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getNotifications);
router.put('/:id/read', markRead);

module.exports = router;
