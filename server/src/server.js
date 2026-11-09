const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const rawOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim().replace(/^['"]|['"]$/g, '').replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...rawOrigins,
  'https://attestify-alpha.vercel.app',
  'http://localhost:5173'
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.has(cleanOrigin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.path.startsWith('/auth/') || req.path.startsWith('/verify/'),
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login/register attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api/verify/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Too many verification attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/credentials', require('./routes/credentials'));
app.use('/api/verify', require('./routes/verify'));
app.use('/api/users', require('./routes/user'));
app.use('/api/network', require('./routes/network'));
app.use('/api/files', require('./routes/files'));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Attestify API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      credentials: '/api/credentials',
      verify: '/api/verify',
      users: '/api/users',
      network: '/api/network',
      files: '/api/files'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

let serverInstance;

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    serverInstance = app.listen(PORT, () => {
      console.log(`\n  Attestify Backend Server\n  Port: ${PORT}\n  Environment: ${process.env.NODE_ENV || 'development'}\n  Database: Connected\n`);
    });
    require('./workers/issuanceWorker');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Closing connections...`);
  if (serverInstance) {
    serverInstance.close(() => console.log('[Server] HTTP server closed'));
  }
  const { prisma } = require('./config/database');
  const { connection } = require('./services/queueService');
  try {
    await prisma.$disconnect();
    if (connection) {
      await connection.quit();
    }
  } catch (e) {
    console.warn('[Server] Error disconnecting cleanly:', e.message);
  }
  process.exit(0);
};

if (!process.env.VERCEL) {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
  });
}

module.exports = app;

