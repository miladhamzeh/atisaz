// models/DataCorrectionRequest.js
const mongoose = require('mongoose');

const statuses = ['pending','sent_to_admin','approved','denied','cancelled'];

const DataCorrectionRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  message: { type: String, required: true },
  proposedChanges: mongoose.Mixed,
  files: [String],
  status: { type: String, enum: statuses, default: 'pending' },
  handledBySecretaryAt: Date,
  secretaryDecision: { type: String, enum: ['accepted','rejected','pending'], default: 'pending' },
  processedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminDecision: { type: String, enum: ['approved','denied','pending'], default: 'pending' },
  adminDecisionAt: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('DataCorrectionRequest', DataCorrectionRequestSchema);
