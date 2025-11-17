// models/BulkCharge.js
const mongoose = require('mongoose');

const BulkChargeSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending','applied','failed'], default: 'pending' },
  entries: [{
    unitNumber: String,
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    maintenanceAmount: { type: Number, default: 0 },
    reserveAmount: { type: Number, default: 0 },
    otherAmount: { type: Number, default: 0 },
    applied: { type: Boolean, default: false },
    error: String
  }],
  metadata: mongoose.Mixed
}, { timestamps: true });

module.exports = mongoose.model('BulkCharge', BulkChargeSchema);
