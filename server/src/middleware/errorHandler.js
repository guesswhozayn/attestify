const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({ error: `${Object.keys(err.keyPattern || {})[0] || 'Field'} already exists` });
  }

  if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Maximum size is 10MB.' : err.message
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: (statusCode === 500 && process.env.NODE_ENV === 'production')
      ? 'Internal Server Error'
      : (err.message || 'Internal Server Error')
  });
};

module.exports = errorHandler;
