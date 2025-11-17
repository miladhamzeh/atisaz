// controllers/renovationController.js
const RenovationRequest = require('../models/RenovationRequest');
const Notification = require('../models/Notification');

// POST /api/renovations
exports.requestRenovation = async (req, res) => {
  try {
    const { unitId: bodyUnitId, description, desiredStart, desiredEnd, attachments } = req.body;
    const usedUnitId = bodyUnitId || req.user.unit;

    if (req.user.role === 'user') {
      if (!usedUnitId) return res.status(400).json({ error: 'No unit assigned to your account. Please contact the secretary.' });
      if (req.user.unit && usedUnitId?.toString() !== req.user.unit.toString()) {
        return res.status(403).json({ error: 'Forbidden: You can only submit for your own unit.' });
      }
    }

    const rr = await RenovationRequest.create({
      unit: usedUnitId,
      applicant: req.user.id,
      description,
      desiredStart,
      desiredEnd,
      attachments,
      status: 'pending'
    });

    await Notification.create({
      roleRecipients: ['secretary','accountant'],
      title: 'New renovation request',
      message: `Unit ${usedUnitId} submitted a renovation request.`
    });

    res.status(201).json(rr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/renovations/:id/approve (accountant/admin)
exports.approveRenovation = async (req, res) => {
  try {
    if (!['accountant','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const { decision, note } = req.body;

    const rr = await RenovationRequest.findById(id).populate('unit applicant');
    if (!rr) return res.status(404).json({ error: 'Not found' });

    rr.accountantDecision = decision;
    rr.accountantDecisionAt = new Date();
    rr.accountantDecisionBy = req.user.id;
    rr.status = decision === 'approved' ? 'approved_by_accountant' : 'denied';
    rr.adminNotes = note || '';
    await rr.save();

    if (decision === 'approved') {
      await Notification.create({
        recipients: [rr.applicant],
        roleRecipients: ['lobbyman','security'],
        title: 'Renovation approved',
        message: `Renovation for unit ${rr.unit.number} approved by accountant.`
      });
    } else {
      await Notification.create({
        recipients: [rr.applicant],
        title: 'Renovation denied',
        message: `Renovation for unit ${rr.unit.number} was denied.`
      });
    }

    res.json(rr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/renovations — کاربر فقط درخواست‌های خودش را می‌بیند
exports.getRenovations = async (req, res) => {
  try {
    const query = (req.user.role === 'user') ? { applicant: req.user.id } : {};
    const list = await RenovationRequest.find(query).sort({ createdAt: -1 }).populate('unit applicant', 'number name');
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
