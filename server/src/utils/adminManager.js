const bcrypt = require('bcryptjs');

const syncSingleAdmin = async (prisma) => {
  const targetEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Administrator';

  if (!targetEmail || !password) {
    console.warn('[Admin] ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment. Skipping admin sync.');
    return null;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const currentAdmins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' }
  });

  const userWithTargetEmail = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  let primaryAdminId = null;

  if (userWithTargetEmail) {
    primaryAdminId = userWithTargetEmail.id;
    await prisma.user.update({
      where: { id: primaryAdminId },
      data: {
        role: 'ADMIN',
        name,
        password: hashedPassword,
        isActive: true
      }
    });
  } else if (currentAdmins.length > 0) {
    primaryAdminId = currentAdmins[0].id;
    await prisma.user.update({
      where: { id: primaryAdminId },
      data: {
        email: targetEmail,
        role: 'ADMIN',
        name,
        password: hashedPassword,
        isActive: true
      }
    });
  } else {
    const created = await prisma.user.create({
      data: {
        name,
        email: targetEmail,
        password: hashedPassword,
        role: 'ADMIN',
        university: 'Attestify Platform',
        isActive: true
      }
    });
    primaryAdminId = created.id;
  }

  await prisma.user.updateMany({
    where: {
      role: 'ADMIN',
      id: { not: primaryAdminId }
    },
    data: {
      role: 'STUDENT',
      isActive: false
    }
  });

  return primaryAdminId;
};

module.exports = { syncSingleAdmin };

