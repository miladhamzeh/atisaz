// routes/dataCorrectionRoutes.js
const express = require('express');
const router = express.Router();
const { submitCorrection, getCorrections, processCorrection } = require('../controllers/dataCorrectionController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// یوزر می‌فرستد
router.post('/', submitCorrection);

// همه لاگین‌شده‌ها می‌بینند؛ کنترلر برای یوزر فقط مال خودش را می‌دهد
router.get('/', getCorrections);

// سیکرتری/ادمین پردازش می‌کنند
router.put('/:id', requireRole('secretary','admin'), processCorrection);

module.exports = router;
