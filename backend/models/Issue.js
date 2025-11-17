// models/Issue.js
const mongoose = require('mongoose');
const categories = ['opt1','opt2','opt3','opt4','opt5','opt6'];

const IssueSchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: categories, default: 'opt1' },
  attachments: [String],
  status: { type: String, enum: ['pending','in_progress','removed','resolved'], default: 'pending' },
  assignedRole: { type: String, default: 'facilities' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closedAt: Date,
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

IssueSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Issue', IssueSchema);
