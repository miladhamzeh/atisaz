// controllers/dataCorrectionController.js
const DataCorrectionRequest = require('../models/DataCorrectionRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { normalizeObjectId } = require('../utils/objectId');
const { ensureUnitForUser } = require('../utils/unitHelper');

// POST /api/data-corrections
exports.submitCorrection = async (req, res) => {
  try {
    const { message, proposedChanges, files } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const normalizedUnit = await ensureUnitForUser(req.user);

    const doc = await DataCorrectionRequest.create({
      user: req.user.id,
      unit: normalizedUnit || null,
      message,
      proposedChanges,
      files
    });

    await Notification.create({
      roleRecipients: ['secretary'],
      title: 'Data correction request',
      message: `${req.user.name} submitted a data correction request.`
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('Data correction submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/data-corrections
exports.getCorrections = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'secretary') {
      query.status = { $in: ['pending', 'sent_to_admin', 'approved', 'denied'] };
    } else if (req.user.role === 'admin') {
      query.status = { $in: ['sent_to_admin', 'approved', 'denied'] };
    } else {
      query.user = req.user.id;
    }
    query.user   = req.user.id;

    const docs = await DataCorrectionRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email role')
      .populate('unit', 'number name');

    res.json(docs);
  } catch (err) {
    console.error('Data correction list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/data-corrections/:id  — secretary/admin
exports.processCorrection = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'secretary') {
      const { secretaryDecision, notes } = req.body; // accepted|rejected
      if (!['accepted','rejected'].includes(secretaryDecision))
        return res.status(400).json({ error: 'Invalid secretaryDecision' });

      const doc = await DataCorrectionRequest.findById(id);
      if (!doc) return res.status(404).json({ error: 'Not found' });

      doc.secretaryDecision = secretaryDecision;
      doc.handledBySecretaryAt = new Date();
      doc.status = secretaryDecision === 'accepted' ? 'sent_to_admin' : 'denied';
      if (notes) doc.notes = (doc.notes || '') + (doc.notes ? '\n' : '') + notes;
      await doc.save();

      if (secretaryDecision === 'accepted') {
        await Notification.create({
          roleRecipients: ['admin'],
          title: 'Data correction awaiting admin',
          message: `Request ${doc._id} approved by secretary, awaiting admin approval.`
        });
      } else {
        await Notification.create({
          recipients: [doc.user],
          title: 'Data correction denied',
          message: 'Your data correction request was denied by the secretary.'
        });
      }
      return res.json(doc);
    }

    if (req.user.role === 'admin') {
      const { adminDecision, adminNote } = req.body; // approved|denied
      if (!['approved','denied'].includes(adminDecision))
        return res.status(400).json({ error: 'Invalid adminDecision' });

      const doc = await DataCorrectionRequest.findById(id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      if (doc.status !== 'sent_to_admin')
        return res.status(400).json({ error: 'Request must be approved by secretary first' });

      doc.adminDecision = adminDecision;
      doc.adminDecisionAt = new Date();
      doc.processedByAdmin = req.user.id;
      doc.status = adminDecision === 'approved' ? 'approved' : 'denied';
      if (adminNote) doc.notes = (doc.notes || '') + (doc.notes ? '\n' : '') + adminNote;
      await doc.save();

      if (adminDecision === 'approved' && doc.proposedChanges) {
        await User.findByIdAndUpdate(doc.user, doc.proposedChanges);
      }

      await Notification.create({
        recipients: [doc.user],
        title: `Data correction ${doc.status}`,
        message: `Your data correction request was ${doc.status}`
      });

      return res.json(doc);
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    console.error('Data correction process error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
