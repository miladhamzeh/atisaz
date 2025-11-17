// models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  assignedToRole: { type: String }, // 'accountant','secretary','facilities','lobbyman','security','admin'
  assignedToUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open','in_progress','closed','on_hold'], default: 'open' },
  relatedUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    message: String,
    attachments: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  priority: { type: String, enum: ['low','normal','high'], default: 'normal' },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
