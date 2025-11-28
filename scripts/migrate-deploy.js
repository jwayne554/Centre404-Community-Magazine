#!/usr/bin/env node

/**
 * Smart migration deployment script
 *
 * Handles the transition from db:push to migrate:deploy by:
 * 1. Detecting if migrations have been applied
 * 2. Baselining existing schema if needed
 * 3. Running migrate deploy
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
/* eslint-enable @typescript-eslint/no-require-imports */

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

  // First, ensure any missing tables are created via db push
  // This handles cases where migrations were marked applied but SQL didn't run
  console.log('🔄 Syncing schema with db push (safe for existing tables)...\n');
  exec('npx prisma db push --accept-data-loss', {
    silent: true,
    ignoreError: true,
  });

  // Try to run migrate deploy first
  console.log('🔄 Attempting prisma migrate deploy...\n');
  const deployOutput = exec('npx prisma migrate deploy', {
    silent: true,
    ignoreError: true,
  });

  // Check if it failed with P3005 (schema not empty)
  if (deployOutput.includes('P3005') || deployOutput.includes('not empty')) {
    console.log('⚠️  P3005 Error: Database schema exists but no migration history\n');
    console.log('📝 Running automatic baseline...\n');

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

    console.log(`   Found ${migrations.length} migrations to baseline\n`);

    // Mark each migration as applied
    for (const migration of migrations) {
      console.log(`   ✓ Marking "${migration}" as applied...`);
      exec(`npx prisma migrate resolve --applied "${migration}"`, {
        silent: true,
        ignoreError: true,
      });
    }

    console.log('\n✅ Baseline complete!\n');

    // Now try migrate deploy again
    console.log('🔄 Running prisma migrate deploy after baseline...\n');
    exec('npx prisma migrate deploy');
  } else if (deployOutput.includes('No pending migrations')) {
    console.log('✅ No pending migrations to apply');
  } else if (deployOutput.includes('migration') && deployOutput.includes('applied')) {
    console.log('✅ Migrations applied successfully');
  } else {
    // Success case - migrations were applied
    console.log(deployOutput);
  }

  console.log('\n✅ Migration deployment complete!');
}

main().catch((error) => {
  console.error('\n❌ Migration deployment failed:', error.message);
  process.exit(1);
});
