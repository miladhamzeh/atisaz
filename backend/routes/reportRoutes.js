// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { debtsAndPaymentsXlsx } = require('../controllers/reportController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/debts-payments', requireRole('accountant','secretary','admin'), debtsAndPaymentsXlsx);

module.exports = router;
