// routes/renovationRoutes.js
const express = require('express');
const router = express.Router();
const { requestRenovation, getRenovations, approveRenovation } = require('../controllers/renovationController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

// ارسال درخواست بازسازی
router.post('/', upload.array('attachments'), requestRenovation);

// همه لاگین‌شده‌ها می‌بینند؛ کنترلر برای یوزر فقط مال خودش را می‌دهد
router.get('/', getRenovations);

// تایید توسط حسابدار/ادمین
router.put('/:id/approve', requireRole('accountant','admin'), approveRenovation);

module.exports = router;
