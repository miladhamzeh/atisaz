// controllers/newsController.js
const News = require('../models/News');

exports.create = async (req, res) => {
  try {
    if (!['secretary','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const { title, body, visibleTo, pinned } = req.body;
    const images = (req.files || []).map(f => `/uploads/${f.filename}`);
    const news = await News.create({ title, body, images, visibleTo: visibleTo || [], author: req.user.id, pinned: !!pinned });
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const list = await News.find({ archived: false }).sort({ pinned: -1, createdAt: -1 }).populate('author', 'name role');
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    if (!['secretary','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const { title, body, pinned, archived } = req.body;
    const images = (req.files || []).map(f => `/uploads/${f.filename}`);
    const update = { title, body, pinned, archived };
    if (images.length) update.$push = { images: { $each: images } };
    const n = await News.findByIdAndUpdate(id, update, { new: true });
    res.json(n);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!['secretary','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    await News.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createNews = exports.create;
exports.getAllNews = exports.list;
exports.deleteNews = exports.delete;
exports.updateNews = exports.update;
