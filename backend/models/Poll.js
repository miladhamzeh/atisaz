// models/Poll.js
const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['poll','vote'], default: 'poll' },
  options: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    label: { type: String, required: true },
    meta: mongoose.Mixed,
    votesCount: { type: Number, default: 0 }
  }],
  responses: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    selectedOptionId: { type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now }
  }],
  startAt: { type: Date },
  endAt: { type: Date },
  allowMultiple: { type: Boolean, default: false },
  visible: { type: Boolean, default: true }
}, { timestamps: true });

PollSchema.index({ endAt: 1 });

module.exports = mongoose.model('Poll', PollSchema);
