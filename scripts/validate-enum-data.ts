/**
 * Validate existing data before converting to enums
 * Task 3.1: Convert to Database Enums
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateEnumData() {
  console.log('🔍 Validating existing data for enum migration...\n');

  let hasErrors = false;

  // 1. Check User.role
  console.log('1️⃣ Checking User.role...');
  const invalidRoles = await prisma.$queryRaw<Array<{ role: string; count: number }>>`
    SELECT role, COUNT(*)::int as count
    FROM "User"
    WHERE role NOT IN ('ADMIN', 'MODERATOR', 'CONTRIBUTOR')
    GROUP BY role
  `;

  if (invalidRoles.length > 0) {
    console.log('❌ Found invalid role values:');
    invalidRoles.forEach(r => console.log(`   - "${r.role}": ${r.count} records`));
    hasErrors = true;
  } else {
    console.log('✅ All User.role values are valid\n');
  }

  // 2. Check Submission.status
  console.log('2️⃣ Checking Submission.status...');
  const invalidStatuses = await prisma.$queryRaw<Array<{ status: string; count: number }>>`
    SELECT status, COUNT(*)::int as count
    FROM "Submission"
    WHERE status NOT IN ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED')
    GROUP BY status
  `;

  if (invalidStatuses.length > 0) {
    console.log('❌ Found invalid status values:');
    invalidStatuses.forEach(s => console.log(`   - "${s.status}": ${s.count} records`));
    hasErrors = true;
  } else {
    console.log('✅ All Submission.status values are valid\n');
  }

  // 3. Check Submission.category
  console.log('3️⃣ Checking Submission.category...');
  const invalidCategories = await prisma.$queryRaw<Array<{ category: string; count: number }>>`
    SELECT category, COUNT(*)::int as count
    FROM "Submission"
    WHERE category NOT IN ('MY_NEWS', 'SAYING_HELLO', 'MY_SAY')
    GROUP BY category
  `;

  if (invalidCategories.length > 0) {
    console.log('❌ Found invalid category values:');
    invalidCategories.forEach(c => console.log(`   - "${c.category}": ${c.count} records`));
    hasErrors = true;
  } else {
    console.log('✅ All Submission.category values are valid\n');
  }

  // 4. Check Submission.contentType
  console.log('4️⃣ Checking Submission.contentType...');
  const invalidContentTypes = await prisma.$queryRaw<Array<{ contentType: string; count: number }>>`
    SELECT "contentType", COUNT(*)::int as count
    FROM "Submission"
    WHERE "contentType" NOT IN ('TEXT', 'IMAGE', 'AUDIO', 'DRAWING', 'MIXED')
    GROUP BY "contentType"
  `;

  if (invalidContentTypes.length > 0) {
    console.log('❌ Found invalid contentType values:');
    invalidContentTypes.forEach(c => console.log(`   - "${c.contentType}": ${c.count} records`));
    hasErrors = true;
  } else {
    console.log('✅ All Submission.contentType values are valid\n');
  }

  // 5. Check Magazine.status
  console.log('5️⃣ Checking Magazine.status...');
  const invalidMagazineStatuses = await prisma.$queryRaw<Array<{ status: string; count: number }>>`
    SELECT status, COUNT(*)::int as count
    FROM "Magazine"
    WHERE status NOT IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')
    GROUP BY status
  `;

  if (invalidMagazineStatuses.length > 0) {
    console.log('❌ Found invalid Magazine.status values:');
    invalidMagazineStatuses.forEach(s => console.log(`   - "${s.status}": ${s.count} records`));
    hasErrors = true;
  } else {
    console.log('✅ All Magazine.status values are valid\n');
  }

  // 6. Check Media.type
  console.log('6️⃣ Checking Media.type...');
  const invalidMediaTypes = await prisma.$queryRaw<Array<{ type: string; count: number }>>`
    SELECT type, COUNT(*)::int as count
    FROM "Media"
    WHERE type NOT IN ('IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT')
    GROUP BY type
  `;

  if (invalidMediaTypes.length > 0) {
    console.log('❌ Found invalid Media.type values:');
    invalidMediaTypes.forEach(t => console.log(`   - "${t.type}": ${t.count} records`));
    hasErrors = true;
  } else {
    console.log('✅ All Media.type values are valid\n');
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (hasErrors) {
    console.log('❌ VALIDATION FAILED - Fix data before migration\n');
    process.exit(1);
  } else {
    console.log('✅ ALL VALIDATIONS PASSED - Safe to proceed with enum migration\n');
    process.exit(0);
  }
}

validateEnumData()
  .catch((error) => {
    console.error('Error validating data:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
