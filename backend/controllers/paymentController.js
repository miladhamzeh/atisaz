// controllers/paymentController.js
const Payment = require('../models/Payment');
const Charge = require('../models/Charge');
const { Types } = require('mongoose');
const { normalizeObjectId } = require('../utils/objectId');

const buildPaymentPipeline = (unitId) => {
  const pipeline = [];
  if (unitId) {
    try {
      pipeline.push({ $match: { unit: new Types.ObjectId(unitId) } });
    } catch (err) {
      // If a bad id sneaks through, short-circuit to an empty result set instead of throwing
      pipeline.push({ $match: { _id: null } });
    }
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'users', localField: 'processedBy', foreignField: '_id', as: 'processedBy' } },
    { $unwind: { path: '$processedBy', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'units', localField: 'unit', foreignField: '_id', as: 'unit' } },
    { $unwind: { path: '$unit', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'charges', localField: 'appliedTo', foreignField: '_id', as: 'appliedToDetails' } },
  );

  return pipeline;
};

exports.addPayment = async (req, res) => {
  try {
    const { unitId, amount, method, appliedToChargeIds, receiptRef, notes } = req.body;
    const normalizedUnitId = normalizeObjectId(unitId);
    if (!normalizedUnitId || !amount) return res.status(400).json({ error: 'Missing or invalid required fields' });

    if (req.user.role === 'user' && normalizeObjectId(req.user.unit)?.toString() !== normalizedUnitId) {
      return res.status(403).json({ error: 'Cannot pay for other units' });
    }

    const payment = await Payment.create({
      unit: normalizedUnitId,
      user: req.user.id,
      amount,
      method,
      appliedTo: appliedToChargeIds || [],
      receiptRef,
      notes,
      processedBy: ['accountant', 'admin'].includes(req.user.role) ? req.user.id : null,
      processedAt: ['accountant', 'admin'].includes(req.user.role) ? new Date() : null,
    });

    if (Array.isArray(appliedToChargeIds) && appliedToChargeIds.length) {
      await Charge.updateMany({ _id: { $in: appliedToChargeIds } }, { $set: { paid: true, paidAt: new Date() } });
    }

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const normalizedUnit = normalizeObjectId(req.query.unitId);
    if (req.query.unitId && !normalizedUnit) return res.status(400).json({ error: 'Invalid unit id' });

    const query = {};
    if (normalizedUnit) query.unit = normalizedUnit;
    else if (req.user.role === 'user') {
      const userUnit = normalizeObjectId(req.user.unit);
      if (!userUnit) return res.status(400).json({ error: 'Unit missing from your profile' });
      query.unit = userUnit;
    }
    const payments = await Payment.aggregate(buildPaymentPipeline(query.unit));
    res.set('Cache-Control', 'no-store');
    res.status(200).json(payments);
  } catch (err) {
    console.error('getAllPayments error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPaymentsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    if (req.user.role === 'user' && req.user.unit?.toString() !== unitId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const normalizedUnitId = normalizeObjectId(unitId);
    if (!normalizedUnitId) return res.status(400).json({ error: 'Invalid unit id' });

    const payments = await Payment.aggregate(buildPaymentPipeline(normalizedUnitId));
    res.set('Cache-Control', 'no-store');
    res.status(200).json(payments);
  } catch (err) {
    console.error('getPaymentsByUnit error', err);
    res.status(500).json({ error: 'Server error' });
  }
};
