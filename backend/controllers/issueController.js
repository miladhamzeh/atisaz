// controllers/issueController.js
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { normalizeObjectId } = require('../utils/objectId');

// POST /api/issues
exports.reportIssue = async (req, res) => {
  try {
    const { unitId, title, description, category, attachments } = req.body;
    const usedUnitId = normalizeObjectId(unitId) || normalizeObjectId(req.user.unit);

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const myUnit = normalizeObjectId(req.user.unit);
    if (req.user.role === 'user' && myUnit && usedUnitId?.toString() !== myUnit.toString()) {
      return res.status(403).json({ error: 'Forbidden: You can only report for your own unit.' });
    }

    const issue = await Issue.create({
      unit: usedUnitId || undefined,
      reportedBy: req.user.id,
      title,
      description,
      category,
      attachments
    });

    await Notification.create({
      roleRecipients: ['facilities'],
      title: 'New issue reported',
      message: `Issue "${title}" reported by ${req.user.name}`
    });

    res.status(201).json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/issues/:id/status  (facilities only)
exports.updateIssueStatus = async (req, res) => {
  try {
    if (req.user.role !== 'facilities') return res.status(403).json({ error: 'Forbidden' });
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Not found' });
    const { status, comment } = req.body;
    issue.status = status;
    if (comment) issue.comments.push({ author: req.user.id, message: comment });
    issue.assignedTo = req.user.id;
    if (status === 'removed' || status === 'resolved') issue.closedAt = new Date();
    await issue.save();

    await Notification.create({
      recipients: [issue.reportedBy],
      title: `Issue updated: ${issue.title}`,
      message: `Status updated to ${status}`
    });

    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/issues — کاربر فقط گزارش‌های خودش را می‌بیند
exports.getIssues = async (req, res) => {
  try {
    const query = (req.user.role === 'user') ? { reportedBy: req.user.id } : {};
    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .populate('reportedBy assignedTo comments.author', 'name email role unit unitName')
      .populate('unit', 'number building floor');
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
