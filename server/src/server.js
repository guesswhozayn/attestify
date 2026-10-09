const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
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

const allowedOrigin = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

app.use(cors({
  origin: [allowedOrigin, `${allowedOrigin}/`],
  credentials: true
}));

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

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

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n  Attestify Backend Server\n  Port: ${PORT}\n  Environment: ${process.env.NODE_ENV || 'development'}\n  Database: Connected\n`);
    });
    require('./workers/issuanceWorker');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
