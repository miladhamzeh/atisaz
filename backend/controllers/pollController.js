// controllers/pollController.js
const Poll = require('../models/Poll');

exports.create = async (req, res) => {
  try {
    if (!['secretary','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const { title, description, type, options, startAt, endAt, allowMultiple } = req.body;
    const opts = (options || []).map(label => ({ label }));
    const poll = await Poll.create({
      title, description, type, options: opts, startAt, endAt, allowMultiple: !!allowMultiple, createdBy: req.user.id
    });
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.respond = async (req, res) => {
  try {
    const pollId = req.params.id || req.params.pollId;
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ error: 'Not found' });
    const now = new Date();
    if (poll.startAt && now < poll.startAt) return res.status(400).json({ error: 'Poll not started' });
    if (poll.endAt && now > poll.endAt) return res.status(400).json({ error: 'Poll ended' });

    const { selectedOptionIds } = req.body;
    const selected = Array.isArray(selectedOptionIds) ? selectedOptionIds : [selectedOptionIds];
    if (!poll.allowMultiple && selected.length > 1) return res.status(400).json({ error: 'Multiple selections not allowed' });

    for (const optId of selected) {
      const opt = poll.options.id(optId);
      if (opt) opt.votesCount = (opt.votesCount || 0) + 1;
      poll.responses.push({ user: req.user.id, selectedOptionId: optId });
    }
    await poll.save();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 }).populate('createdBy', 'name role');
    const safe = polls.map(p => {
      const obj = p.toObject();
      if (obj.type === 'vote' && !['admin','secretary'].includes(req.user.role)) {
        obj.responses = obj.responses.filter(r => r.user.toString() === req.user.id);
      }
      return obj;
    });
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createPoll = exports.create;
exports.getPolls = exports.list;
exports.votePoll = exports.respond;
