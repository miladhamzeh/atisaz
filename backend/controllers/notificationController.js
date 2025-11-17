// controllers/notificationController.js
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const role = req.user.role;
    const notifications = await Notification.find({
      $or: [
        { recipients: req.user.id },
        { roleRecipients: role },
        { recipients: { $size: 0 }, roleRecipients: { $size: 0 } }
      ]
    }).sort({ sentAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const n = await Notification.findById(id);
    if (!n) return res.status(404).json({ error: 'Not found' });
    if (!n.readBy.map(x=>x.toString()).includes(req.user.id.toString())) n.readBy.push(req.user.id);
    await n.save();
    res.json(n);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
