// models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['bank_transfer','card','cash','cheque','other'], default: 'bank_transfer' },
  appliedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Charge' }],
  receiptRef: String,
  notes: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date
}, { timestamps: true });

PaymentSchema.index({ unit: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
