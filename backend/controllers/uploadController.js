// controllers/uploadController.js
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ filename: req.file.filename, path: req.file.path, url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
