require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/db');
const customerRoutes = require('./routes/customers');
const transactionRoutes = require('./routes/transactions');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const corsOptions = allowedOrigins.length
  ? {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
          return callback(null, true);
        }
        const err = new Error(`CORS blocked for origin: ${origin}`);
        err.status = 403;
        return callback(err);
      },
    }
  : undefined;

async function ensureDatabaseConnection(req, res, next) {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Root & health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Khushi General Store API' });
});
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Routes
app.use('/api/customers', ensureDatabaseConnection, customerRoutes);
app.use('/api/transactions', ensureDatabaseConnection, transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB and start local dev server only when executed directly
const PORT = process.env.PORT || 5000;

if (require.main === module && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log('✅ MongoDB connected');
      app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

module.exports = app;
