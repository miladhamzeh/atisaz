// controllers/moveRequestController.js
const MoveRequest = require('../models/MoveRequest');
const Notification = require('../models/Notification');
const Charge = require('../models/Charge');
const Payment = require('../models/Payment');
const { normalizeObjectId } = require('../utils/objectId');

// POST /api/moves — کاربر فقط برای یونیت خودش می‌تواند ثبت کند (unitId اختیاری)
exports.requestMove = async (req, res) => {
  try {
    const { unitId, type, scheduledDate, reason } = req.body;
    const usedUnitId = normalizeObjectId(unitId) || normalizeObjectId(req.user.unit);

    if (req.user.role === 'user') {
      if (!usedUnitId) {
        return res.status(400).json({ error: 'No unit assigned to your account. Please contact the secretary.' });
      }
      const myUnit = normalizeObjectId(req.user.unit);
      if (!myUnit) return res.status(400).json({ error: 'Unit missing from your profile' });
      if (usedUnitId.toString() !== myUnit.toString()) {
        return res.status(403).json({ error: 'Forbidden: You can only submit for your own unit.' });
      }
    }
    if (!usedUnitId) {
       return res.status(400).json({ error: 'Unit is required to submit a move request' });
     }
    // محاسبهٔ بدهی لحظه‌ای
    const charges = await Charge.find({ unit: usedUnitId, paid: false });
    const totalDue = charges.reduce((s, c) => s + c.amount, 0);
    const payments = await Payment.find({ unit: usedUnitId });
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const balance = totalPaid - totalDue;

    const moveRequest = await MoveRequest.create({
      unit: usedUnitId,
      applicant: req.user.id,
      type,
      scheduledDate,
      reason,
      assessedDebt: balance < 0 ? Math.abs(balance) : 0
    });

    res.status(201).json(moveRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/moves/:id/approve|deny — حسابدار/ادمین
exports.process = async (req, res) => {
  try {
    if (!['accountant','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const rawAction = (req.body && (req.body.action || req.body.status)) || '';
    const action = String(rawAction).toLowerCase();
    const { note } = req.body || {};
    const mr = await MoveRequest.findById(id).populate('unit');
    if (!mr) return res.status(404).json({ error: 'Not found' });

    if (action === 'approve' || action === 'approved') {
      if (mr.assessedDebt > 0) {
        return res.status(400).json({ error: `Outstanding debt (${mr.assessedDebt}) must be settled before approval.` });
      }
      mr.status = 'approved';
    } else if (action === 'deny') {
      mr.status = 'denied';
    } else if (['cancelled','cancel'].includes(action)) {
     mr.status = 'cancelled';
   } else if (['pending','review','scheduled'].includes(action)) {
     // "scheduled" maps to the intermediate waiting state until an approval decision is made
      mr.status = action;
    }else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    mr.decisionBy = req.user.id;
    mr.decisionAt = new Date();
    mr.decisionNote = note || '';
    await mr.save();

    await Notification.create({
      roleRecipients: ['lobbyman','security'],
      recipients: [mr.applicant],
      title: `Move request ${mr.status}`,
      message: `Move request for unit ${mr.unit.number} (${mr.type}) has been ${mr.status}.`
    });

    res.json(mr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/moves — کاربر فقط درخواست‌های خودش را می‌بیند
exports.getAllMoves = async (req, res) => {
  try {
    const query = (req.user.role === 'user') ? { applicant: req.user.id } : {};
    const items = await MoveRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('unit applicant decisionBy', 'number name role');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const move = await MoveRequest.findById(id);
    if (!move) return res.status(404).json({ message: 'Move request not found' });

    // فقط منشی یا مدیر اجازه تغییر دارن
    if (!['admin', 'secretary'].includes(req.user.role))
      return res.status(403).json({ message: 'Forbidden' });

    move.status = status;
    await move.save();

    res.json({ message: 'Status updated', move });
  } catch (err) {
    console.error('Update move status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.approveMove = async (req, res) => {
  req.body = { ...(req.body || {}), action: 'approve' };
  return exports.process(req, res);
};
exports.denyMove   = async (req, res) => {
  req.body = { ...(req.body || {}), action: 'deny' };
  return exports.process(req, res);
};
