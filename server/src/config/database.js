const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.env.NODE_ENV === 'production'
  ? (process.env.DATABASE_URL_PROD || process.env.DATABASE_URL)
  : (process.env.DATABASE_URL_DEV || process.env.DATABASE_URL);

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }
    await prisma.$connect();
    console.log(`PostgreSQL Connected via Prisma (${process.env.NODE_ENV === 'production' ? 'Production/Cloud' : 'Development/Local'})`);
  } catch (error) {
    console.error(`PostgreSQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.prisma = prisma;

