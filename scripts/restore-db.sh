#!/bin/bash
# Database restore script

set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-db.sh <backup-file.sql.gz>"
  echo ""
  echo "Available backups:"
  ls -lh /home/ubuntu/backups/nahyunjong_db_*.sql.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Load environment variables
if [ -f .env.production ]; then
  source .env.production
else
  echo "ERROR: .env.production not found"
  exit 1
fi

echo "========================================="
echo "Database Restore"
echo "========================================="
echo "File: $BACKUP_FILE"
echo ""
echo "WARNING: This will REPLACE the current database!"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo ""
echo "Decompressing backup..."
TEMP_FILE=$(mktemp)
gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"

echo "Restoring database..."
docker compose -f docker-compose.prod.yml exec -T db psql -U "$DB_USER" "$DB_NAME" < "$TEMP_FILE"

# Clean up
rm "$TEMP_FILE"

echo ""
echo "========================================="
echo "Restore Complete!"
echo "========================================="
echo ""
