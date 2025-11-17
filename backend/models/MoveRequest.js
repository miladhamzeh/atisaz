// models/MoveRequest.js
const mongoose = require('mongoose');

const statuses = ['pending','approved','denied','cancelled'];

const MoveRequestSchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['move_in','move_out'], required: true },
  scheduledDate: { type: Date },
  reason: { type: String },
  status: { type: String, enum: statuses, default: 'pending' },
  assessedDebt: { type: Number, default: 0 },
  decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decisionAt: { type: Date },
  decisionNote: String,
  notificationsSent: { type: Boolean, default: false },
  metadata: mongoose.Mixed
}, { timestamps: true });

module.exports = mongoose.model('MoveRequest', MoveRequestSchema);
