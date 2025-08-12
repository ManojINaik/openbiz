#!/bin/bash
# Database Migration Script for Udyam Registration System

set -e

# Configuration
DB_NAME=${DB_NAME:-"udyam_db"}
DB_USER=${DB_USER:-"postgres"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}

echo "🚀 Starting database migration for Udyam Registration System..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
    exit 1
fi

# Create database if it doesn't exist
echo "📁 Creating database if it doesn't exist..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database $DB_NAME already exists"

# Run migration
echo "🔄 Running database migration..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"

    # Show table information
    echo "📊 Database tables created:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

    echo "📈 Views created:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dv"

else
    echo "❌ Database migration failed!"
    exit 1
fi

echo "🎉 Migration completed! Your database is ready for the Udyam Registration System."
