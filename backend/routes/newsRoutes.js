// routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const { createNews, getAllNews, deleteNews, updateNews } = require('../controllers/newsController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);
router.post('/', requireRole('secretary','admin'), upload.array('images'), createNews);
router.get('/', getAllNews);
router.put('/:id', requireRole('secretary','admin'), upload.array('images'), updateNews);
router.delete('/:id', requireRole('secretary','admin'), deleteNews);

module.exports = router;
