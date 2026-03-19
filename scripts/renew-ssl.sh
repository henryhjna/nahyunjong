#!/bin/bash
# Renew SSL certificates and reload nginx
# Run via cron: 0 3 * * * cd /home/ubuntu/nahyunjong && ./scripts/renew-ssl.sh >> /var/log/ssl-renew.log 2>&1

set -e

COMPOSE_FILE="docker-compose.prod.yml"
LOG_PREFIX="[ssl-renew $(date '+%Y-%m-%d %H:%M:%S')]"

echo "$LOG_PREFIX Starting certificate renewal check..."

# Attempt renewal
docker compose -f "$COMPOSE_FILE" run --rm certbot renew 2>&1

# Always reload nginx (safe even if no renewal occurred)
docker compose -f "$COMPOSE_FILE" exec -T nginx nginx -s reload 2>&1

echo "$LOG_PREFIX Done."
