exports.requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
  if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
  next();
};

exports.requirePlatformAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Administrative authority required. Access restricted to platform admins.' });
  }
  next();
};

exports.requireVerifiedIssuer = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
  if (req.user.role === 'ADMIN') return next();
  if (req.user.role !== 'ISSUER' || !req.user.issuerDetails?.isVerified) {
    return res.status(403).json({ error: 'Verified Issuer access required. Your institutional account is pending verification.' });
  }
  next();
};

exports.requireAdmin = exports.requirePlatformAdmin;
