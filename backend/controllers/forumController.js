// controllers/forumController.js
const ForumPost = require('../models/ForumPost');

// POST /api/forum
exports.createPost = async (req, res) => {
  try {
    const { title, body, attachments } = req.body;
    const post = await ForumPost.create({ author: req.user.id, title, body, attachments });
    await post.populate({ path: 'author', select: 'name email role' });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/forum
exports.getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'author', select: 'name email role' })
      .populate({ path: 'comments.author', select: 'name email role' }); // ✅ نام/ایمیل کامنت‌گذار
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/forum/:id/comment
exports.commentPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const post = await ForumPost.findById(id);
    if (!post) return res.status(404).json({ error: 'Not found' });

    post.comments.push({ author: req.user.id, message });
    await post.save();

    await post.populate([
      { path: 'author', select: 'name email role' },
      { path: 'comments.author', select: 'name email role' },
    ]);

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
