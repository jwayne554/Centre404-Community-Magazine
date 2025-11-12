#!/usr/bin/env node

/**
 * Smart migration deployment script
 *
 * Handles the transition from db:push to migrate:deploy by:
 * 1. Detecting if migrations have been applied
 * 2. Baselining existing schema if needed
 * 3. Running migrate deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return error.stdout || '';
  }
}

async function main() {
  console.log('🚀 Smart Migration Deployment Starting...\n');

  // Check migration status
  console.log('📊 Checking migration status...');
  const statusOutput = exec('npx prisma migrate status', {
    silent: true,
    ignoreError: true,
  });

  const needsBaseline =
    statusOutput.includes('P3005') ||
    statusOutput.includes('not empty') ||
    statusOutput.includes('No migration found');

  if (needsBaseline) {
    console.log('⚠️  Database needs baselining (existing schema without migrations)\n');

    // Get all migration directories
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.error('❌ No migrations directory found!');
      process.exit(1);
    }

    const migrations = fs
      .readdirSync(migrationsDir)
      .filter((item) => {
        const itemPath = path.join(migrationsDir, item);
        return (
          fs.statSync(itemPath).isDirectory() && item !== 'migration_lock.toml'
        );
      })
      .sort();

    console.log(`📝 Found ${migrations.length} migrations to baseline:\n`);

    // Mark each migration as applied
    for (const migration of migrations) {
      console.log(`  ✓ Marking "${migration}" as applied...`);
      exec(`npx prisma migrate resolve --applied "${migration}"`, {
        ignoreError: true,
      });
    }

    console.log('\n✅ Baseline complete!\n');
  } else {
    console.log('✓ Migration history exists\n');
  }

  // Now run normal migrate deploy
  console.log('🔄 Running prisma migrate deploy...\n');
  exec('npx prisma migrate deploy');

  console.log('\n✅ Migration deployment complete!');
}

main().catch((error) => {
  console.error('\n❌ Migration deployment failed:', error.message);
  process.exit(1);
});
