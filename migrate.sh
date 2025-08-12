#!/bin/bash
# Database Migration Script for Udyam Registration System

set -e

echo "🚀 Starting database migration for Udyam Registration System..."

# Prefer DATABASE_URL when available (Render/Railway/Heroku)
if [ -n "$DATABASE_URL" ]; then
  echo "✅ Using DATABASE_URL for migration"
  psql "$DATABASE_URL" -f database_schema.sql
  echo "📊 Database tables created:"
  psql "$DATABASE_URL" -c "\\dt"
  echo "📈 Views created:"
  psql "$DATABASE_URL" -c "\\dv"
  echo "🎉 Migration completed! Your database is ready."
  exit 0
fi

# Fallback to discrete vars (local/dev)
DB_NAME=${DB_NAME:-"udyam_db"}
DB_USER=${DB_USER:-"postgres"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}

echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"

if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" > /dev/null 2>&1; then
  echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
  exit 1
fi

echo "📁 Creating database if it doesn't exist..."
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null || echo "Database $DB_NAME already exists"

echo "🔄 Running database migration..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database_schema.sql

echo "✅ Database migration completed successfully!"
echo "📊 Database tables created:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\\dt"
echo "📈 Views created:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\\dv"
echo "🎉 Migration completed! Your database is ready for the Udyam Registration System."
