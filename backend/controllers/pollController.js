// controllers/pollController.js
const Poll = require('../models/Poll');
const News = require('../models/News');

const publishResultIfNeeded = async (poll) => {
  if (!poll.endAt || poll.newsPublished) return;
  const now = new Date();
  if (now < poll.endAt) return;

  const totalVotes = poll.options.reduce((sum, o) => sum + (o.votesCount || 0), 0);
  const bodyLines = poll.options.map((o) => `${o.label}: ${o.votesCount || 0} رای`);
  const body = [`نتیجه «${poll.title}»`, `تعداد کل آرا: ${totalVotes}`, ...bodyLines].join('\n');

  await News.create({
    title: `نتایج ${poll.title}`,
    body,
    author: poll.createdBy,
  });
  poll.newsPublished = true;
  await poll.save();
};

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
    if (req.user.role !== 'user') return res.status(403).json({ error: 'فقط ساکنین می‌توانند رای دهند' });
    const pollId = req.params.id || req.params.pollId;
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ error: 'Not found' });
    const now = new Date();
    if (poll.startAt && now < poll.startAt) return res.status(400).json({ error: 'Poll not started' });
    if (poll.endAt && now > poll.endAt) return res.status(400).json({ error: 'Poll ended' });

    const { selectedOptionIds } = req.body;
    const selected = Array.isArray(selectedOptionIds) ? selectedOptionIds : [selectedOptionIds];
    // Enforce single vote per user and single selection per submission
    if (!selected[0]) return res.status(400).json({ error: 'گزینه‌ای انتخاب نشده است' });
    if (selected.length !== 1) return res.status(400).json({ error: 'هر کاربر فقط یک گزینه می‌تواند انتخاب کند' });

    const alreadyVoted = await Poll.exists({ _id: pollId, 'responses.user': req.user.id });
    if (alreadyVoted) {
      return res.status(400).json({ error: 'قبلاً در این رای‌گیری شرکت کرده‌اید' });
    }
    if (!poll.allowMultiple && selected.length > 1) return res.status(400).json({ error: 'Multiple selections not allowed' });

    const optId = selected[0];
const option = poll.options.id(optId);
if (!option) return res.status(400).json({ error: 'گزینه نامعتبر است' });

const updated = await Poll.findOneAndUpdate(
  { _id: pollId, 'responses.user': { $ne: req.user.id } },
  {
    $inc: { 'options.$[opt].votesCount': 1 },
    $push: { responses: { user: req.user.id, selectedOptionId: optId } },
  },
  { new: true, arrayFilters: [{ 'opt._id': optId }] }
);

if (!updated) return res.status(400).json({ error: 'قبلاً در این رای‌گیری شرکت کرده‌اید' });

await publishResultIfNeeded(updated);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const role = req.user.role;
    const isAdmin = role === 'admin';
    const isUser = role === 'user';
    const canSeeAudit = isAdmin;
    let query = Poll.find().sort({ createdAt: -1 }).populate('createdBy', 'name role');
    if (canSeeAudit) {
      query = query.populate({ path: 'responses.user', select: 'name role unit' });
    }
    const polls = await query;
    const now = new Date();
    for (const p of polls) {
      if (p.endAt && now > p.endAt && !p.newsPublished) {
        await publishResultIfNeeded(p);
      }
    }

    const safe = polls.map(p => {
      const obj = p.toObject();
      obj.hasVoted = p.responses.some(r => r.user?.toString() === req.user.id);
        if (obj.type === 'vote' && !canSeeAudit) {
        obj.responses = obj.responses.filter(r => r.user.toString() === req.user.id);
      }
      if (canSeeAudit) {
        obj.responseDetails = obj.responses.map(r => ({
          user: r.user,
          selectedOptionId: r.selectedOptionId,
          optionLabel: (p.options.id(r.selectedOptionId) || {}).label || '—',
          createdAt: r.createdAt,
        }));
      }
      obj.optionAudits = p.options.map((opt) => ({
           optionId: opt._id,
           label: opt.label,
           votesCount: opt.votesCount || 0,
           voters: obj.responses
             .filter((r) => r.selectedOptionId?.toString() === opt._id.toString())
             .map((r) => ({
               user: r.user,
               createdAt: r.createdAt,
             })),
         }));
         // Show live counts only for admins or users when type === 'poll'
         obj.options = obj.options.map(opt => ({
           ...opt,
           votesCount: (obj.type === 'poll' && (isUser || canSeeAudit)) ? (opt.votesCount || 0) : undefined,
         }));
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
