require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/database');

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@attestify.io').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const name = process.env.ADMIN_NAME || 'Platform Administrator';

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing) {
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          isActive: true
        }
      });
      console.log(`[SeedAdmin] Updated existing user ${email} to Role.ADMIN.`);
      return updated;
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        university: 'Attestify Platform',
        isActive: true
      }
    });
    console.log(`[SeedAdmin] Created new platform administrator: ${email}`);
    return created;
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

