#!/usr/bin/env tsx
/**
 * ONE-TIME FIX: Apply enum migration to production
 *
 * This script safely applies the database enum migration that was
 * skipped during baseline. It checks if enums exist first.
 *
 * Run this once on production, then delete this file.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing production database enums...');

  try {
    // Check if UserRole enum exists
    const checkEnum = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'UserRole'
      ) as exists;
    `;

    if (checkEnum[0]?.exists) {
      console.log('✅ Enums already exist - no fix needed');
      return;
    }

    console.log('📝 Enums missing - applying migration...');

    // Step 1: Create enum types (one at a time!)
    await prisma.$executeRawUnsafe(`CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MODERATOR', 'CONTRIBUTOR')`);
    await prisma.$executeRawUnsafe(`CREATE TYPE "SubmissionCategory" AS ENUM ('MY_NEWS', 'SAYING_HELLO', 'MY_SAY')`);
    await prisma.$executeRawUnsafe(`CREATE TYPE "SubmissionContentType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'DRAWING', 'MIXED')`);
    await prisma.$executeRawUnsafe(`CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED')`);
    await prisma.$executeRawUnsafe(`CREATE TYPE "MagazineStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED')`);
    await prisma.$executeRawUnsafe(`CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT')`);
    console.log('   ✓ Created enum types');

    // Step 2: Convert User.role column (one statement at a time!)
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CONTRIBUTOR'::"UserRole"`);
    console.log('   ✓ Converted User.role');

    // Step 3: Convert Submission columns (one statement at a time!)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ALTER COLUMN "category" TYPE "SubmissionCategory" USING "category"::"SubmissionCategory"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ALTER COLUMN "contentType" TYPE "SubmissionContentType" USING "contentType"::"SubmissionContentType"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ALTER COLUMN "status" DROP DEFAULT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ALTER COLUMN "status" TYPE "SubmissionStatus" USING "status"::"SubmissionStatus"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"SubmissionStatus"`);
    console.log('   ✓ Converted Submission columns');

    // Step 4: Convert Magazine.status (one statement at a time!)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Magazine" ALTER COLUMN "status" DROP DEFAULT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Magazine" ALTER COLUMN "status" TYPE "MagazineStatus" USING "status"::"MagazineStatus"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Magazine" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"MagazineStatus"`);
    console.log('   ✓ Converted Magazine.status');

    // Step 5: Convert Media.type (single statement)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Media" ALTER COLUMN "type" TYPE "MediaType" USING "type"::"MediaType"`);
    console.log('   ✓ Converted Media.type');

    console.log('✅ Enum migration applied successfully!');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Failed to apply enum migration:', error.message);
    } else {
      console.error('❌ Failed to apply enum migration:', error);
    }
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
