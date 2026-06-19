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

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

connectDB();

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
const normalizedOrigin = allowedOrigin.endsWith('/') ? allowedOrigin.slice(0, -1) : allowedOrigin;

app.use(cors({
  origin: [normalizedOrigin, `${normalizedOrigin}/`],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login/register attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const authRoutes = require('./routes/auth');
const credentialRoutes = require('./routes/credentials');
const verifyRoutes = require('./routes/verify');
const userRoutes = require('./routes/user');
const networkRoutes = require('./routes/network');
const fileRoutes = require('./routes/files');

app.use('/api/auth', authRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/files', fileRoutes);

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

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
  Attestify Backend Server
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Database: Connected
  `);
});

server.setTimeout(150000);
server.keepAliveTimeout = 150000;

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
