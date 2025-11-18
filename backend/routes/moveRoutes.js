// routes/moveRoutes.js
const express = require('express');
const router = express.Router();
const { requestMove, getAllMoves, approveMove, denyMove } = require('../controllers/moveRequestController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// ارسال درخواست
router.post('/', requestMove);

// همه لاگین‌شده‌ها می‌بینند؛ کنترلر برای یوزر فقط مال خودش را می‌دهد
router.get('/', getAllMoves);

// تایید/رد توسط حسابدار یا ادمین
router.put('/:id/approve', requireRole('accountant','admin'), approveMove);
router.put('/:id/deny', requireRole('accountant','admin'), denyMove);
router.patch('/:id', requireRole('accountant','admin'), (req, res) => {
  // به‌منظور سازگاری با فرانت، action از بادی خوانده می‌شود
  return require('../controllers/moveRequestController').process(req, res);
});
// router.patch('/:id/status', protect, authorize('admin', 'secretary'), updateStatus);

module.exports = router;
