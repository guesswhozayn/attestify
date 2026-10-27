const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : (err.meta?.target || 'field');
    return res.status(400).json({ error: `Unique constraint failed: ${target} already exists` });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: err.meta?.cause || 'Record not found' });
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
