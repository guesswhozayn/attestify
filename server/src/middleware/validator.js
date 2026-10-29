const fs = require('fs');

const cleanupFiles = (req) => {
  if (req.file?.path && fs.existsSync(req.file.path)) {
    try { fs.unlinkSync(req.file.path); } catch (e) {}
  }
  if (req.files) {
    const fileLists = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    for (const f of fileLists) {
      if (f?.path && fs.existsSync(f.path)) {
        try { fs.unlinkSync(f.path); } catch (e) {}
      }
    }
  }
};

const validate = (schema) => (req, res, next) => {
  const result = schema(req);
  if (result) {
    cleanupFiles(req);
    return res.status(400).json({ error: result });
  }
  next();
};

const isEmail = (val) => typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
const isHexAddress = (val) => typeof val === 'string' && /^0x[0-9a-fA-F]{40}$/.test(val.trim());

const validateRegister = (req) => {
  const { email, password, role } = req.body;
  if (!email || !isEmail(email)) return 'A valid email address is required';
  if (!password || typeof password !== 'string' || password.length < 6) return 'Password must be at least 6 characters long';
  if (role && !['STUDENT', 'ISSUER'].includes(role)) return 'Role must be STUDENT or ISSUER';
  return null;
};

const validateLogin = (req) => {
  const { email, password } = req.body;
  if (!email || !isEmail(email)) return 'A valid email address is required';
  if (!password || typeof password !== 'string') return 'Password is required';
  return null;
};

const validateIssue = (req) => {
  const { studentWalletAddress, studentName, issueDate } = req.body;
  if (!studentWalletAddress || !isHexAddress(studentWalletAddress)) return 'A valid 0x Ethereum student wallet address is required';
  if (!studentName || typeof studentName !== 'string' || !studentName.trim()) return 'Student name is required';
  if (!issueDate || isNaN(Date.parse(issueDate))) return 'A valid issue date is required';
  if (new Date(issueDate) > new Date()) return 'Issue date cannot be in the future';
  return null;
};

module.exports = { validate, validateRegister, validateLogin, validateIssue, isHexAddress };
