// controllers/chargeController.js
const Charge = require('../models/Charge');
const BulkCharge = require('../models/BulkCharge');
const Unit = require('../models/Unit');
const Notification = require('../models/Notification');
const xlsx = require('xlsx');
const { normalizeObjectId } = require('../utils/objectId');

const mapChargeType = (rawType) => {
  const value = String(rawType || '').toLowerCase();
  if (['جاری', 'current', 'operational', 'maintenance', 'regular', 'regular_maintenance'].includes(value)) {
    return 'regular_maintenance';
  }
  if (['عمرانی', 'capital', 'construction', 'reserve', 'capital_reserve'].includes(value)) {
    return 'capital_reserve';
  }
  return 'other';
};

exports.createCharge = async (req, res) => {
  try {
    if (!['accountant','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const { unitId, description, amount, type, dueDate } = req.body;
    const normalizedUnitId = normalizeObjectId(unitId);
    if (!normalizedUnitId) return res.status(400).json({ error: 'Invalid unit id' });
    const unit = await Unit.findById(normalizedUnitId);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    const normalizedType = mapChargeType(type);

    const charge = await Charge.create({
      unit: unit._id,
      description,
      amount,
      type: normalizedType,
      dueDate,
      issuedBy: req.user.id
    });

    if (unit.residents?.length) {
      await Notification.create({
        recipients: unit.residents,
        title: 'New charge applied',
        message: `A new ${normalizedType} charge of ${amount} was applied to unit ${unit.number}.`,
      });
    }
    res.status(201).json(charge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCharges = async (req, res) => {
  try {
    const { unitId } = req.query;
    const query = {};
    const normalizedUnit = normalizeObjectId(unitId);

    if (unitId && !normalizedUnit) return res.status(400).json({ error: 'Invalid unit id' });

    if (normalizedUnit) query.unit = normalizedUnit;
    else if (req.user.role === 'user') {
      const userUnit = normalizeObjectId(req.user.unit);
      if (!userUnit) return res.status(400).json({ error: 'Unit missing from your profile' });
      query.unit = userUnit;
    }
    const charges = await Charge.find(query).sort({ createdAt: -1 }).populate('unit issuedBy', 'number name email');
    res.set('Cache-Control', 'no-store');
    res.status(200).json(charges);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getChargesByUnit = async (req, res) => {
  try {
    const unitId = normalizeObjectId(req.params.unitId);
    if (!unitId) return res.status(400).json({ error: 'Invalid unit id' });

    if (req.user.role === 'user' && normalizeObjectId(req.user.unit)?.toString() !== unitId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const charges = await Charge.find({ unit: unitId }).populate('unit issuedBy', 'number name email');
    res.set('Cache-Control', 'no-store');
    res.status(200).json(charges);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCharge = async (req, res) => {
  try {
    if (!['accountant','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const charge = await Charge.findByIdAndDelete(req.params.id);
    if (!charge) return res.status(404).json({ error: 'Charge not found' });
    res.json({ message: 'Charge deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


// Excel bulk upload (memory)
exports.uploadExcel = async (req, res) => {
  try {
    if (!['accountant','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

    const entries = rows.map(r => ({
      unitNumber: r.unitNumber || r.unit || r.Unit || null,
      maintenanceAmount: Number(r.maintenanceAmount || r.maintenance || 0),
      reserveAmount: Number(r.reserveAmount || r.reserve || 0),
      otherAmount: Number(r.otherAmount || r.other || 0),
    }));

    const bulk = await BulkCharge.create({
      filename: req.file.originalname,
      uploadedBy: req.user.id,
      status: 'pending',
      entries
    });

    res.status(201).json({ bulk });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to parse file' });
  }
};

exports.applyBulk = async (req, res) => {
  try {
    if (!['accountant','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const bulk = await BulkCharge.findById(req.params.id);
    if (!bulk) return res.status(404).json({ error: 'Not found' });
    if (bulk.status === 'applied') return res.status(400).json({ error: 'Already applied' });

    for (const e of bulk.entries) {
      try {
        if (!e.unit && e.unitNumber) {
          const unit = await Unit.findOne({ number: e.unitNumber });
          if (unit) e.unit = unit._id;
        }
        if (!e.unit) { e.error = 'Unit not found'; continue; }

        if (e.maintenanceAmount > 0) {
          await Charge.create({
            unit: e.unit,
            description: 'Regular Maintenance (bulk)',
            amount: e.maintenanceAmount,
            type: 'regular_maintenance',
            issuedBy: req.user.id,
            bulk: bulk._id
          });
        }
        if (e.reserveAmount > 0) {
          await Charge.create({
            unit: e.unit,
            description: 'Capital Reserve Fee (bulk)',
            amount: e.reserveAmount,
            type: 'capital_reserve',
            issuedBy: req.user.id,
            bulk: bulk._id
          });
        }
        if (e.otherAmount > 0) {
          await Charge.create({
            unit: e.unit,
            description: 'Other Fee (bulk)',
            amount: e.otherAmount,
            type: 'other',
            issuedBy: req.user.id,
            bulk: bulk._id
          });
        }
        e.applied = true;
      } catch (ex) {
        e.error = ex.message;
      }
    }

    bulk.status = 'applied';
    await bulk.save();
    res.json({ bulk });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
