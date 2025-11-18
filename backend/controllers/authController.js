// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Unit = require('../models/Unit');
const crypto = require('crypto');
const { isValidObjectId } = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(48).toString('hex');

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set. A random secret was generated for this process; restart will invalidate existing tokens.');
}
// Helper: ساخت شماره یونیت یکتا
function generateUnitNumberForUser(user) {
  return `UN-${user._id.toString().slice(-6).toUpperCase()}`;
}
function normalizeUnitId(raw) {
  if (!raw) return undefined;
  if (typeof raw === 'string' && isValidObjectId(raw)) return raw;
  if (typeof raw === 'object' && raw._id && isValidObjectId(raw._id)) return raw._id;
  return undefined;
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, unit, unitNumber } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    // 1) ابتدا کاربر
    let user = await User.create({
      name,
      email: email.toLowerCase(),
      password, // pre-save hook هش می‌کند
      role: role || "user",
      phone,
      unit: normalizeUnitId(unit) || undefined,
    });

    let linkedUnitDoc = null;

    // 2) سناریوهای ایجاد/اتصال یونیت
    if (unitNumber && !user.unit) {
      // اگر unitNumber فرستاده شده بود، تلاش کن همان را پیدا/بساز
      const normalized = unitNumber.trim();
        let u = await Unit.findOne({ number: normalized });
      if (!u) {
        u = await Unit.create({
          number: normalized,
          owner: user._id,
          occupants: [user._id],
        });
      } else if (!u.occupants.some(x => x.toString() === user._id.toString())) {
        u.occupants.push(user._id);
        await u.save();
      }
      user.unit = u._id;
      linkedUnitDoc = u;
      await user.save();
    } else if (!user.unit) {
      // یونیت از قبل داده نشده؛ خودمان بسازیم
      const unitNum = generateUnitNumberForUser(user);
      const u = await Unit.create({
        number: unitNum,
        owner: user._id,
        occupants: [user._id],
      });
      user.unit = u._id;
      linkedUnitDoc = u;
      await user.save();
    } else {
      // اگر unit صراحتاً داده بودی، کاربر را به occupants اضافه کن
      const u = await Unit.findById(user.unit);
      if (u && !u.occupants.some(x => x.toString() === user._id.toString())) {
        u.occupants.push(user._id);
        await u.save();
      }
      linkedUnitDoc = u;
    }

    // 3) توکن
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    // let linkedUnit = null;
    if (user.unit) linkedUnit = await Unit.findById(user.unit);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, unit: user.unit, unitNumber: linkedUnitDoc?.number },
  token,
  });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // ✅ همان Secret واحد
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    let linkedUnitDoc = null;
    if (user.unit) {
       const rawUnitId = typeof user.unit === 'object' && user.unit._id ? user.unit._id : user.unit;
       if (isValidObjectId(rawUnitId)) {
         linkedUnitDoc = await Unit.findById(rawUnitId);
       }
     }
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, unit: user.unit, unitNumber: linkedUnitDoc?.number }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
