// routes/chargeRoutes.js
const express = require('express');
const router = express.Router();
const { createCharge, getCharges, getChargesByUnit, deleteCharge, uploadExcel, applyBulk } = require('../controllers/chargeController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { upload, uploadMemory } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.post('/', requireRole('accountant','admin'), createCharge);

// GET باز؛ کنترلر برای یوزر فقط شارژهای یونیت خودش را برمی‌گرداند
router.get('/', getCharges);
router.get('/unit/:unitId', getChargesByUnit);

router.delete('/:id', requireRole('accountant','admin'), deleteCharge);

// اکسل (اختیاری)
router.post('/bulk/upload', requireRole('accountant','admin'), uploadMemory.single('file'), uploadExcel);
router.post('/bulk/:id/apply', requireRole('accountant','admin'), applyBulk);

module.exports = router;
