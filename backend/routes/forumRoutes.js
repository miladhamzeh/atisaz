// routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const { createPost, getPosts, commentPost } = require('../controllers/forumController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/', createPost);
router.get('/', getPosts);
router.post('/:id/comment', commentPost);

module.exports = router;
