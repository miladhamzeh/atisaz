// models/Charge.js
const mongoose = require('mongoose');

const chargeTypes = ['regular_maintenance', 'capital_reserve', 'other'];

const ChargeSchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: chargeTypes, default: 'regular_maintenance' },
  dueDate: { type: Date },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bulk: { type: mongoose.Schema.Types.ObjectId, ref: 'BulkCharge' },
  paid: { type: Boolean, default: false },
  paidAt: { type: Date },
  metadata: mongoose.Mixed
}, { timestamps: true });

ChargeSchema.index({ unit: 1, dueDate: 1 });

module.exports = mongoose.model('Charge', ChargeSchema);
