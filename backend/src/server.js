const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const authRoutes = require('./routes/auth');
const credentialRoutes = require('./routes/credentials');
const verifyRoutes = require('./routes/verify');
const userRoutes = require('./routes/user');
const networkRoutes = require('./routes/network');
const publicRoutes = require('./routes/public');

app.use('/api/auth', authRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/user', userRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/public', publicRoutes);

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
      admin: '/api/admin',
      network: '/api/network'
    }
  });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  Attestify Backend Server
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Database: Connected
  `);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
