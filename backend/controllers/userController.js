// controllers/userController.js
const User = require('../models/User');
const Unit = require('../models/Unit');
const { normalizeObjectId } = require('../utils/objectId');

let Ticket, Charge, Payment;
try { Ticket = require('../models/Ticket'); } catch {}
try { Charge = require('../models/Charge'); } catch {}
try { Payment = require('../models/Payment'); } catch {}

function genUnitNumber(u) {
  return `UN-${u._id.toString().slice(-6).toUpperCase()}`;
}

exports.getAllUsers = async (req, res) => {
  try {
    if (['admin','secretary','accountant'].includes(req.user.role)) {
      const users = await User.find().populate('unit').select('-password');
      return res.json(users);
    }
    const user = await User.findById(req.user.id).populate('unit').select('-password');
    res.json([user]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.role !== 'admin' && req.user.role !== 'secretary' && req.user.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await User.findById(id).select('-password').populate('unit');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updates = { ...req.body };
    delete updates.password;
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.assignToUnit = async (req, res) => {
  try {
    if (!['admin','secretary'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const { userId } = req.params;
    const { unitId } = req.body;
    const unit = await Unit.findById(unitId);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    const user = await User.findByIdAndUpdate(userId, { unit: unit._id }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!unit.occupants.includes(user._id)) {
      unit.occupants.push(user._id);
      await unit.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.backfillUnits = async (req, res) => {
  try {
    if (!['admin','secretary'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });

    const noUnitUsers = await User.find({ $or: [{ unit: { $exists: false } }, { unit: null }] });
    let created = 0;

    for (const u of noUnitUsers) {
      const unitNumber = genUnitNumber(u);
      const newUnit = await Unit.create({
        number: unitNumber,
        owner: u._id,
        occupants: [u._id],
      });
      u.unit = newUnit._id;
      await u.save();
      created++;
    }

    res.json({ fixedUsers: created });
  } catch (err) {
    console.error('backfillUnits error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    // جلوگیری از 304
    res.set('Cache-Control', 'no-store');

    const role = req.user.role;

    if (['admin','secretary','accountant'].includes(role)) {
      const totalUsers = await User.countDocuments();
      const totalUnits = await Unit.countDocuments();
      const openTickets = Ticket ? await Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } }) : 0;
      const unpaidCharges = Charge ? await Charge.countDocuments({ paid: false }) : 0;
      const totalPayments = Payment ? await Payment.countDocuments() : 0;

      return res.json({ totalUsers, totalUnits, openTickets, unpaidCharges, totalPayments });
    }

    const unitId = normalizeObjectId(req.user.unit);
    const myUnit = unitId ? await Unit.findById(unitId).select('number') : null;
    const unpaidCharges = unitId && Charge ? await Charge.countDocuments({ unit: unitId, paid: false }) : 0;
    const totalPaymentsByUser = Payment
      ? await Payment.aggregate([
          { $match: { user: req.user._id } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      : [];
    const paymentsSum = totalPaymentsByUser[0]?.total || 0;

    res.json({
      me: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, unit: myUnit },
      unpaidCharges,
      paymentsSum
    });
  } catch (err) {
    console.error('getSummary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
