const crypto = require('crypto');
const fs = require('fs');

class HashService {
  generateSHA256(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve('0x' + hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  generateSHA256FromBuffer(buffer) {
    return '0x' + crypto.createHash('sha256').update(buffer).digest('hex');
  }

  verifyHash(filePath, expectedHash) {
    return this.generateSHA256(filePath).then(actualHash => actualHash === expectedHash);
  }
}

module.exports = new HashService();
