// models/News.js
const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String },
  images: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pinned: { type: Boolean, default: false },
  visibleTo: [{ type: String }],
  archived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
