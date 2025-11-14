#!/bin/bash
# Initialize SSL certificates with Let's Encrypt

set -e

DOMAIN="${1:-nahyunjong.com}"
EMAIL="${2:-na.hyunjong@gmail.com}"

echo "========================================="
echo "SSL Certificate Initialization"
echo "========================================="
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Create certbot directories
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Start nginx with HTTP only (for certbot challenge)
docker compose -f docker-compose.prod.yml up -d nginx

# Wait for nginx to be ready
echo "Waiting for nginx to start..."
sleep 10

# Request certificate
echo "Requesting SSL certificate from Let's Encrypt..."
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

# Reload nginx to use the new certificate
echo "Reloading nginx with SSL configuration..."
docker compose -f docker-compose.prod.yml restart nginx

echo ""
echo "========================================="
echo "SSL certificate installed successfully!"
echo "========================================="
echo ""
echo "Certificate will auto-renew every 12 hours via certbot container"
