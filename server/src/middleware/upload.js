const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { FILE_LIMITS } = require('../config/constants');

fs.mkdirSync('uploads', { recursive: true });

const SUB_DIRS = {
  avatar: 'uploads/avatars/',
  certificate: 'uploads/certificates/',
  file: 'uploads/batch/'
};

const ALLOWED_EXTS = new Set(['.csv', '.pdf']);

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
    if (FILE_LIMITS.ALLOWED_TYPES.includes(file.mimetype) || ALLOWED_EXTS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type! Please upload an image (JPG, PNG, WEBP), CSV or PDF file.'), false);
    }
  },
  limits: { fileSize: FILE_LIMITS.MAX_SIZE }
});

module.exports = upload;
