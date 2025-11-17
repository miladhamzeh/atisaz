// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  roleRecipients: [{ type: String }],
  title: { type: String, required: true },
  message: { type: String },
  link: { type: String },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentAt: { type: Date, default: Date.now },
  metadata: mongoose.Mixed,
  urgent: { type: Boolean, default: false }
}, { timestamps: true });

NotificationSchema.index({ sentAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
