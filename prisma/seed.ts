import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roles = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Full system access with user and role management privileges',
    permissions: ['*'],
  },
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Operational access for orders, catalogue, and customers',
    permissions: ['dashboard.view', 'orders.view', 'orders.update', 'packages.view', 'customers.view'],
  },
];

async function main(): Promise<void> {
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!password && process.env.NODE_ENV === 'production') {
    throw new Error('INITIAL_ADMIN_PASSWORD must be set before production seeding.');
  }

  for (const role of roles) {
    await prisma.roles.upsert({
      where: { id: role.id },
      update: {
        name: role.name,
        description: role.description,
        permissions: JSON.stringify(role.permissions),
        is_system: true,
      },
      create: {
        ...role,
        permissions: JSON.stringify(role.permissions),
        is_system: true,
      },
    });
  }

  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL ?? 'admin@happinessdeliver.com').toLowerCase();
  const adminName = process.env.INITIAL_ADMIN_NAME ?? 'Happiness Deliver Admin';
  const existingAdmin = await prisma.admin_users.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await prisma.admin_users.create({
      data: {
        id: 'admin-super-01',
        name: adminName,
        email: adminEmail,
        password_hash: await bcrypt.hash(password ?? 'change-this-before-production', 12),
        role_id: 'role-super-admin',
        role_name: 'Super Admin',
        status: 'ACTIVE',
      },
    });
  }

  await prisma.store_settings.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main' },
  });

  console.log(`Prisma seed complete. Bootstrap admin: ${adminEmail}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
