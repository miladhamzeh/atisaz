// controllers/paymentController.js
const Payment = require('../models/Payment');
const Charge = require('../models/Charge');

exports.addPayment = async (req, res) => {
  try {
    const { unitId, amount, method, appliedToChargeIds, receiptRef, notes } = req.body;
    if (!unitId || !amount) return res.status(400).json({ error: 'Missing required fields' });

    if (req.user.role === 'user' && req.user.unit?.toString() !== unitId) {
      return res.status(403).json({ error: 'Cannot pay for other units' });
    }

    const payment = await Payment.create({
      unit: unitId,
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
    const query = req.query.unitId ? { unit: req.query.unitId } :
      (req.user.role === 'user' ? { unit: req.user.unit } : {});
    const payments = await Payment.find(query).sort({ createdAt: -1 }).populate('user unit appliedTo');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPaymentsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    if (req.user.role === 'user' && req.user.unit?.toString() !== unitId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const payments = await Payment.find({ unit: unitId }).sort({ createdAt: -1 }).populate('user unit appliedTo');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
