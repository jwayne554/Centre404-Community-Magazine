#!/usr/bin/env tsx
/**
 * Production Initialization Script
 *
 * Creates the admin user for production deployments.
 * Safe to run multiple times (uses upsert).
 * Does NOT create test submissions or sample data.
 *
 * For development with sample data, use: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Initializing production database...');

  // Create admin user (safe to run multiple times)
  const adminPassword = await bcrypt.hash('password123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Test Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user ready: admin@test.com');
  console.log('🎉 Production initialization completed!');
}

main()
  .catch((e) => {
    console.error('❌ Production initialization failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
