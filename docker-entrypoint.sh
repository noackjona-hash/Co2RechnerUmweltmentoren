#!/bin/bash
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss

echo "🌱 Seeding database..."
npx prisma db seed 2>/dev/null || echo "Seed skipped (may already exist)"

echo "🚀 Starting application..."
exec "$@"
