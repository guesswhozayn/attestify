const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { FILE_LIMITS } = require('../config/constants');

const BASE_UPLOAD_DIR = process.env.VERCEL ? path.join(os.tmpdir(), 'uploads') : 'uploads';

fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });

const SUB_DIRS = {
  certificate: path.join(BASE_UPLOAD_DIR, 'certificates'),
  file: path.join(BASE_UPLOAD_DIR, 'batch'),
  studentImage: path.join(BASE_UPLOAD_DIR, 'images')
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
      const targetDir = SUB_DIRS[file.fieldname] || BASE_UPLOAD_DIR;
      fs.mkdirSync(targetDir, { recursive: true });
      cb(null, targetDir);
    },
    filename(req, file, cb) {
      const safeExt = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
      cb(null, `${file.fieldname}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`);
    }
  }),
  fileFilter(req, file, cb) {
    const createUploadError = (msg) => {
      const err = new Error(msg);
      err.statusCode = 400;
      return err;
    };
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = FIELD_EXTS[file.fieldname];
    const allowedMimes = FIELD_MIMES[file.fieldname];

    if (!allowedExts || !allowedMimes) {
      return cb(createUploadError(`Unexpected upload field: ${file.fieldname}`), false);
    }
    if (!allowedExts.has(ext)) {
      return cb(createUploadError(`Invalid file extension for ${file.fieldname}. Allowed: ${Array.from(allowedExts).join(', ')}`), false);
    }
    if (!allowedMimes.has(file.mimetype)) {
      return cb(createUploadError(`Invalid MIME type for ${file.fieldname}. Allowed: ${Array.from(allowedMimes).join(', ')}`), false);
    }
    cb(null, true);
  },
  limits: { fileSize: FILE_LIMITS.MAX_SIZE }
});

module.exports = upload;
