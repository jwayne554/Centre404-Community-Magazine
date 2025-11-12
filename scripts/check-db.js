#!/usr/bin/env node

/**
 * Database connection checker for Railway deployment
 * Run this to verify your DATABASE_URL is accessible
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
/* eslint-enable @typescript-eslint/no-require-imports */

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
    console.log('\n📝 In Railway:');
    console.log('1. Go to your project');
    console.log('2. Click on "Variables" tab');
    console.log('3. Add DATABASE_URL pointing to your Postgres service');
    console.log('   Example: ${{Postgres.DATABASE_URL}}');
    process.exit(1);
  }

  console.log('✓ DATABASE_URL is set');
  console.log(`📍 Connection string: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

  const prisma = new PrismaClient();

  try {
    // Try to connect
    await prisma.$connect();
    console.log('✅ Successfully connected to database!\n');

    // Check if tables exist
    try {
      const count = await prisma.submission.count();
      console.log(`✅ Database tables exist (${count} submissions found)`);
    } catch {
      console.log('⚠️  Database connected but tables not found');
      console.log('📝 You need to run migrations:');
      console.log('   npm run db:push');
    }

    await prisma.$disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if PostgreSQL service is running in Railway');
    console.log('2. Verify DATABASE_URL in Railway Variables tab');
    console.log('3. Make sure your web service is linked to the Postgres service');
    console.log('4. Try using: ${{Postgres.DATABASE_URL}} as the variable value');

    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDatabase().catch(console.error);
