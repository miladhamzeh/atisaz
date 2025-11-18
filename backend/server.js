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

app.use(cors({ origin: true, credentials: true }));
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
