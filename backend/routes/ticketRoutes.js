// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const { createTicket, getTickets, addTicketMessage } = require('../controllers/ticketController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// ساخت تیکت
router.post('/', createTicket);

// لیست تیکت‌ها (همه لاگین‌شده‌ها؛ کنترلر فیلتر می‌کند)
router.get('/', getTickets);

// پاسخ به تیکت
router.post('/:id/message', addTicketMessage);

module.exports = router;
