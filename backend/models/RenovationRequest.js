// models/RenovationRequest.js
const mongoose = require('mongoose');

const statuses = ['pending','approved_by_accountant','denied','scheduled','completed','cancelled'];

const RenovationRequestSchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  desiredStart: Date,
  desiredEnd: Date,
  attachments: [String],
  status: { type: String, enum: statuses, default: 'pending' },
  accountantDecision: { type: String, enum: ['approved','denied','pending'], default: 'pending' },
  accountantDecisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accountantDecisionAt: Date,
  notificationsSent: { type: Boolean, default: false },
  adminNotes: String
}, { timestamps: true });

module.exports = mongoose.model('RenovationRequest', RenovationRequestSchema);
