const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { FILE_LIMITS } = require('../config/constants');

fs.mkdirSync('uploads', { recursive: true });

const SUB_DIRS = {
  certificate: 'uploads/certificates/',
  file: 'uploads/batch/',
  studentImage: 'uploads/images/'
};

const FIELD_EXTS = {
  file: new Set(['.csv']),
  certificate: new Set(['.pdf']),
  studentImage: new Set(['.jpg', '.jpeg', '.png', '.webp'])
};

const FIELD_MIMES = {
  file: new Set(['text/csv', 'application/vnd.ms-excel', 'text/plain']),
  certificate: new Set(['application/pdf']),
  studentImage: new Set(['image/jpeg', 'image/png', 'image/webp'])
};

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const targetDir = SUB_DIRS[file.fieldname] || 'uploads/';
      fs.mkdirSync(targetDir, { recursive: true });
      cb(null, targetDir);
    },
    filename(req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = FIELD_EXTS[file.fieldname];
    const allowedMimes = FIELD_MIMES[file.fieldname];

    if (allowedExts && !allowedExts.has(ext)) {
      return cb(new Error(`Invalid file extension for ${file.fieldname}. Allowed: ${Array.from(allowedExts).join(', ')}`), false);
    }
    if (allowedMimes && !allowedMimes.has(file.mimetype)) {
      return cb(new Error(`Invalid MIME type for ${file.fieldname}. Allowed: ${Array.from(allowedMimes).join(', ')}`), false);
    }
    cb(null, true);
  },
  limits: { fileSize: FILE_LIMITS.MAX_SIZE }
});

module.exports = upload;
