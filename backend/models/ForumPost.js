// models/ForumPost.js
const mongoose = require('mongoose');

const ForumPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  body: { type: String, required: true },
  attachments: [String],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', ForumPostSchema);
