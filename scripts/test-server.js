const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

const serverDir = path.resolve(__dirname, '../server/src');
const files = getFiles(serverDir);

for (const file of files) {
  try {
    execSync(`node --check "${file}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`Syntax error in ${file}:`, err.message);
    process.exit(1);
  }
}

try {
  require('../server/src/config/constants');
  require('../server/src/models/User');
  require('../server/src/models/Credential');
  require('../server/src/utils/mutex');
} catch (err) {
  console.error('Module initialization error:', err.message);
  process.exit(1);
}

async function verifyDatabase() {
  if (!process.env.DATABASE_URL || (process.env.CI && !process.env.CI_TEST_DB)) {
    console.log('[SKIP] Live database verification skipped (CI mode or DATABASE_URL not set).');
    return;
  }

  const { prisma } = require('../server/src/config/database');
  const User = require('../server/src/models/User');
  const Credential = require('../server/src/models/Credential');

  try {
    await prisma.$connect();
    console.log('[PASS] PostgreSQL connected via Prisma.');

    const testEmail = `test_${Date.now()}@example.com`;
    const user = await User.create({
      name: 'DB Test Issuer',
      email: testEmail,
      password: 'StrongPassword123!',
      role: 'ISSUER',
      university: 'Attestify University',
      walletAddress: '0x1234567890123456789012345678901234567890'
    });

    const isMatch = await user.comparePassword('StrongPassword123!');
    if (!isMatch) throw new Error('Password verification failed');

    const found = await User.findOne({ email: testEmail });
    if (!found || found.id !== user.id) throw new Error('User find query failed');

    const cred = await Credential.create({
      studentWalletAddress: '0x0000000000000000000000000000000000000001',
      studentName: 'Test Student',
      university: 'Attestify University',
      issueDate: new Date(),
      type: 'CERTIFICATION',
      issuedBy: user.id,
      certificateHash: `test_hash_${Date.now()}`,
      status: 'PENDING'
    });

    const foundCred = await Credential.findById(cred.id).populate('issuedBy');
    if (!foundCred || foundCred.id !== cred.id || foundCred.issuedBy?.id !== user.id) {
      throw new Error('Credential populate/find query failed');
    }

    await prisma.credential.delete({ where: { id: cred.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();

    console.log('[PASS] Prisma User and Credential CRUD & relation queries verified.');
  } catch (err) {
    console.error('[FAIL] Database verification failed:', err.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verifyDatabase().then(() => {
  console.log(`[PASS] Server verification: ${files.length} JavaScript files checked.`);
});
