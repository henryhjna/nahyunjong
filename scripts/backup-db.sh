#!/bin/bash
# Database backup script

set -e

BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="nahyunjong_db_$TIMESTAMP.sql"

# Load environment variables
if [ -f .env.production ]; then
  source .env.production
else
  echo "ERROR: .env.production not found"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "========================================="
echo "Database Backup"
echo "========================================="
echo "Timestamp: $TIMESTAMP"
echo "File: $BACKUP_FILE"
echo ""

# Create backup
echo "Creating database backup..."
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Upload to S3 (if AWS CLI is configured)
if command -v aws &> /dev/null; then
  echo "Uploading to S3..."
  aws s3 cp "$BACKUP_DIR/$BACKUP_FILE.gz" "s3://$BACKUP_S3_BUCKET/database/$BACKUP_FILE.gz"
  echo "Uploaded to S3: s3://$BACKUP_S3_BUCKET/database/$BACKUP_FILE.gz"
fi

# Delete local backups older than 7 days
echo "Cleaning old local backups..."
find "$BACKUP_DIR" -name "nahyunjong_db_*.sql.gz" -mtime +7 -delete

echo ""
echo "========================================="
echo "Backup Complete!"
echo "========================================="
echo "Location: $BACKUP_DIR/$BACKUP_FILE.gz"
echo ""
