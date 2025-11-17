// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/uploadMiddleware');
const { uploadFile } = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/', upload.single('file'), uploadFile);

module.exports = router;
