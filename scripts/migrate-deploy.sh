#!/bin/bash
set -e

echo "🚀 Starting migration deployment..."

# Check if migrations table exists and has records
MIGRATION_COUNT=$(npx prisma migrate status 2>&1 | grep -c "migration found" || echo "0")

if [ "$MIGRATION_COUNT" = "0" ]; then
  echo "⚠️  No migration history found - attempting baseline..."

  # Check if database has tables (non-empty schema)
  HAS_TABLES=$(npx prisma db execute --stdin <<EOF
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
EOF
  )

  if [ ! -z "$HAS_TABLES" ] && [ "$HAS_TABLES" != "0" ]; then
    echo "📊 Database schema exists - marking migrations as applied..."

    # Mark all existing migrations as applied
    for migration in prisma/migrations/*/; do
      if [ -d "$migration" ]; then
        migration_name=$(basename "$migration")
        echo "  ✓ Marking $migration_name as applied"
        npx prisma migrate resolve --applied "$migration_name" || true
      fi
    done

    echo "✅ Baseline complete!"
  else
    echo "📝 Empty database - running migrations normally..."
  fi
fi

# Now run normal migration deploy
echo "🔄 Running prisma migrate deploy..."
npx prisma migrate deploy

echo "✅ Migration deployment complete!"
