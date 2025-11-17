// controllers/ticketController.js
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');

// POST /api/tickets
exports.createTicket = async (req, res) => {
  try {
    const { subject, unitId, assignedToUser, assignedToRole } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject is required' });

    const ticket = await Ticket.create({
      subject,
      createdBy: req.user.id,
      unit: unitId || req.user.unit,
      assignedToUser,
      assignedToRole
    });

    if (assignedToUser) {
      await Notification.create({
        recipients: [assignedToUser],
        title: 'New ticket assigned',
        message: `Ticket "${subject}" created and assigned to you.`
      });
    } else if (assignedToRole) {
      await Notification.create({
        roleRecipients: [assignedToRole],
        title: 'New ticket assigned',
        message: `Ticket "${subject}" created and assigned to ${assignedToRole}.`
      });
    }

    await ticket.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedToUser', select: 'name email role' },
    ]);

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/tickets/:id/message
exports.addTicketMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments } = req.body;
    const t = await Ticket.findById(id);
    if (!t) return res.status(404).json({ error: 'Not found' });

    t.messages.push({ sender: req.user.id, role: req.user.role, message, attachments });
    if (t.status === 'open') t.status = 'in_progress';
    await t.save();

    if (t.assignedToUser) {
      await Notification.create({
        recipients: [t.assignedToUser],
        title: `Reply on ticket ${t.subject}`,
        message: `${req.user.name} replied`
      });
    } else if (t.assignedToRole) {
      await Notification.create({
        roleRecipients: [t.assignedToRole],
        title: `Reply on ticket ${t.subject}`,
        message: `${req.user.name} replied`
      });
    }

    await t.populate('createdBy assignedToUser messages.sender', 'name email role');
    res.json(t);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/tickets — کاربر: ساخته‌ها + تیکت‌های ارجاع‌شده به خودش/نقشش
exports.getTickets = async (req, res) => {
  try {
    const r = req.user.role;
    const me = req.user.id;

    // کاربر: تیکت‌هایی که ساخته یا مستقیم به او ارجاع شده
    // نقش‌های سازمانی: تیکت‌های ارجاع‌شده به نقش‌شان یا مستقیم به خودشان
    // ادمین/سکرتری: همه
    const or = [{ createdBy: me }, { assignedToUser: me }];
    if (!['admin','secretary'].includes(r)) or.push({ assignedToRole: r });
    const query = ['admin','secretary'].includes(r) ? {} : { $or: or };

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy assignedToUser messages.sender', 'name email role');

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
