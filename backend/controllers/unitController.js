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
    const units = await Unit.find().populate('residents', 'name email role');
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate('residents', '-password');
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
