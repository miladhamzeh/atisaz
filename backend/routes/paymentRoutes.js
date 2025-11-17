// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { addPayment, getPaymentsByUnit, getAllPayments } = require('../controllers/paymentController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// اجازه دهید یوزر هم پرداخت خودش را ثبت کند (کنترلر جلوی پرداخت برای یونیت دیگران را می‌گیرد)
router.post('/', addPayment);

// GET باز؛ کنترلر داده مناسب نقش را برمی‌گرداند
router.get('/', getAllPayments);
router.get('/unit/:unitId', getPaymentsByUnit);

module.exports = router;
