require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { prisma } = require('../src/config/database');
const { syncSingleAdmin } = require('../src/utils/adminManager');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required in .env');
  }

  try {
    const adminId = await syncSingleAdmin(prisma);
    console.log(`[SeedAdmin] Guaranteed single Platform administrator (Email: ${email}, ID: ${adminId})`);
    return adminId;
  } catch (error) {
    console.error('[SeedAdmin] Failed to seed admin:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedAdmin;

