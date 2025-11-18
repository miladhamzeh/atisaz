// controllers/unitController.js
const Unit = require('../models/Unit');

exports.createUnit = async (req, res) => {
  try {
    if (!['admin','secretary'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const unit = await Unit.create(req.body);
    res.status(201).json(unit);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Unit already exists' });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUnits = async (req, res) => {
  try {
    const { search, number, name } = req.query;
    const regexes = [];
    if (search) regexes.push(new RegExp(search, 'i'));
    if (number) regexes.push(new RegExp(number, 'i'));
    if (name) regexes.push(new RegExp(name, 'i'));

    const baseQuery = {};
    if (number && !search) {
      baseQuery.number = new RegExp(number, 'i');
    }

    const units = await Unit.find(baseQuery)
      .populate('occupants', 'name email role unit')
      .sort({ number: 1 })
      .lean();

    const filtered = regexes.length
      ? units.filter((u) => {
          return regexes.every((rx) =>
            rx.test(u.number || '') ||
            rx.test(u.building || '') ||
            rx.test(u.floor || '') ||
            (u.occupants || []).some((r) => rx.test(r.name || '') || rx.test(r.email || ''))
          );
        })
      : units;

    res.json(filtered);
  } catch (err) {
    console.error('getUnits error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate('occupants', '-password');
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    if (req.user.role !== 'secretary' && req.user.role !== 'admin' && (!req.user.unit || req.user.unit.toString() !== unit._id.toString())) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(unit);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    if (!['admin','secretary'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(unit);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const deleted = await Unit.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Unit not found' });
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
