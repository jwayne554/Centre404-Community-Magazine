/**
 * Cleanup Orphaned Media Script (Task 1.5)
 *
 * Finds and optionally deletes:
 * 1. Filesystem files in public/uploads/ with no Media record
 * 2. Media records with no submissionId (not linked to any Submission)
 *
 * Usage:
 *   npm run media:cleanup -- --dry-run    # List orphaned files only
 *   npm run media:cleanup -- --delete     # Delete orphaned files
 */

import { PrismaClient } from '@prisma/client';
import { readdir, unlink, stat } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface CleanupStats {
  orphanedFiles: string[];
  orphanedRecords: { id: string; url: string }[];
  filesDeleted: number;
  recordsDeleted: number;
}

async function findOrphanedFiles(): Promise<string[]> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const orphaned: string[] = [];

  try {
    // Check if upload directory exists
    try {
      await stat(uploadDir);
    } catch {
      console.log('📁 Upload directory does not exist yet: public/uploads/');
      return [];
    }

    // Read all files in uploads directory
    const files = await readdir(uploadDir);
    console.log(`📂 Found ${files.length} files in public/uploads/`);

    // Check each file against Media table
    for (const file of files) {
      const url = `/uploads/${file}`;
      const mediaRecord = await prisma.media.findFirst({
        where: { url },
      });

      if (!mediaRecord) {
        orphaned.push(file);
      }
    }

    return orphaned;
  } catch (error) {
    console.error('❌ Error reading upload directory:', error);
    return [];
  }
}

async function findOrphanedRecords(): Promise<{ id: string; url: string }[]> {
  try {
    const orphaned = await prisma.media.findMany({
      where: {
        submissionId: null,
      },
      select: {
        id: true,
        url: true,
      },
    });

    return orphaned;
  } catch (error) {
    console.error('❌ Error querying Media records:', error);
    return [];
  }
}

async function deleteOrphanedFiles(files: string[]): Promise<number> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  let deleted = 0;

  for (const file of files) {
    try {
      await unlink(path.join(uploadDir, file));
      deleted++;
      console.log(`  🗑️  Deleted file: ${file}`);
    } catch (error) {
      console.error(`  ❌ Failed to delete ${file}:`, error);
    }
  }

  return deleted;
}

async function deleteOrphanedRecords(
  records: { id: string; url: string }[]
): Promise<number> {
  let deleted = 0;

  for (const record of records) {
    try {
      await prisma.media.delete({
        where: { id: record.id },
      });
      deleted++;
      console.log(`  🗑️  Deleted record: ${record.url}`);
    } catch (error) {
      console.error(`  ❌ Failed to delete record ${record.id}:`, error);
    }
  }

  return deleted;
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || !args.includes('--delete');

  console.log('\n🔍 Orphaned Media Cleanup Script');
  console.log('================================\n');

  if (isDryRun) {
    console.log('🔵 Running in DRY-RUN mode (no deletions)');
    console.log('   Use --delete flag to actually delete files\n');
  } else {
    console.log('🔴 Running in DELETE mode');
    console.log('   Orphaned files will be permanently deleted!\n');
  }

  const stats: CleanupStats = {
    orphanedFiles: [],
    orphanedRecords: [],
    filesDeleted: 0,
    recordsDeleted: 0,
  };

  // Find orphaned filesystem files
  console.log('🔎 Step 1: Checking for orphaned files in filesystem...');
  stats.orphanedFiles = await findOrphanedFiles();
  console.log(`   Found ${stats.orphanedFiles.length} orphaned files\n`);

  if (stats.orphanedFiles.length > 0) {
    console.log('📄 Orphaned files:');
    stats.orphanedFiles.forEach((file) => console.log(`   - ${file}`));
    console.log();
  }

  // Find orphaned Media records
  console.log('🔎 Step 2: Checking for orphaned Media records...');
  stats.orphanedRecords = await findOrphanedRecords();
  console.log(`   Found ${stats.orphanedRecords.length} orphaned records\n`);

  if (stats.orphanedRecords.length > 0) {
    console.log('📋 Orphaned Media records:');
    stats.orphanedRecords.forEach((record) =>
      console.log(`   - ${record.url} (id: ${record.id})`)
    );
    console.log();
  }

  // Delete if requested
  if (!isDryRun) {
    console.log('🗑️  Step 3: Deleting orphaned media...\n');

    if (stats.orphanedFiles.length > 0) {
      console.log('Deleting orphaned files:');
      stats.filesDeleted = await deleteOrphanedFiles(stats.orphanedFiles);
      console.log();
    }

    if (stats.orphanedRecords.length > 0) {
      console.log('Deleting orphaned records:');
      stats.recordsDeleted = await deleteOrphanedRecords(stats.orphanedRecords);
      console.log();
    }
  }

  // Summary
  console.log('📊 Summary');
  console.log('==========');
  console.log(`Orphaned files found:     ${stats.orphanedFiles.length}`);
  console.log(`Orphaned records found:   ${stats.orphanedRecords.length}`);

  if (!isDryRun) {
    console.log(`Files deleted:            ${stats.filesDeleted}`);
    console.log(`Records deleted:          ${stats.recordsDeleted}`);
  }

  console.log();
}

main()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
