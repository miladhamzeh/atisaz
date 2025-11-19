// server.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/atisazDB';
const PORT = process.env.PORT || 5001;

const app = express();

// Disable etags to avoid 304 responses with empty bodies that break cached fetches
app.set('etag', false);
app.disable('x-powered-by');

// --- Security headers (lightweight helmet alternative without new deps) ---
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// --- Basic rate limiter to slow brute-force attempts ---
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_MAX = 400; // requests per window per IP
const rateStore = new Map();

app.use((req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const current = rateStore.get(key) || { count: 0, reset: now + RATE_WINDOW_MS };

  if (now > current.reset) {
    current.count = 0;
    current.reset = now + RATE_WINDOW_MS;
  }

  current.count += 1;
  rateStore.set(key, current);

  if (current.count > RATE_MAX) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }

  next();
});

// --- CORS allowlist ---
const defaultDevOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://127.0.0.1:3000',
  'https://127.0.0.1:3000',
];

const envOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

  const hasExplicitOrigins = envOrigins.length > 0;
  const hasWildcard = envOrigins.includes('*');
  const corsLockedDown = hasExplicitOrigins && !hasWildcard;
  const allowedOrigins = corsLockedDown ? envOrigins : defaultDevOrigins;

  if (!corsLockedDown && !hasWildcard) {
    console.warn('⚠️  ALLOWED_ORIGINS is not configured; temporarily allowing all origins. Set ALLOWED_ORIGINS to lock down CORS.');
  }


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server or curl
      if (!corsLockedDown || hasWildcard) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/units', require('./routes/unitRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/moves', require('./routes/moveRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/charges', require('./routes/chargeRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/api/renovations', require('./routes/renovationRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/data-corrections', require('./routes/dataCorrectionRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));

// Error handler (last)
app.use(errorHandler);

// DB & server
mongoose
  .connect(MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log(`✅ MongoDB connected:‌ ${MONGO_URI} `);
    app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });
