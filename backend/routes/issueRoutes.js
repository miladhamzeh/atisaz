// routes/IssueRoutes.js
const express = require('express');
const router = express.Router();
const { reportIssue, getIssues, updateIssueStatus } = require('../controllers/issueController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

// ثبت مشکل
router.post('/', upload.array('attachments'), reportIssue);

// همه لاگین‌شده‌ها می‌بینند؛ کنترلر برای یوزر فقط مال خودش را می‌دهد
router.get('/', getIssues);

// تغییر وضعیت فقط توسط تاسیسات
router.put('/:id/status', requireRole('facilities'), updateIssueStatus);

module.exports = router;
