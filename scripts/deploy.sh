#!/bin/bash
# Deployment script for nahyunjong application

set -e

echo "========================================="
echo "nahyunjong Deployment Script"
echo "========================================="

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "ERROR: .env.production file not found!"
  echo "Please create .env.production from .env.production.example"
  exit 1
fi

# Load environment variables
source .env.production

echo ""
echo "Step 1: Pulling latest code..."
git pull origin master

echo ""
echo "Step 2: Building Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

echo ""
echo "Step 3: Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

echo ""
echo "Step 4: Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "Step 5: Waiting for services to be ready..."
sleep 20

echo ""
echo "Step 6: Checking service health..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Services:"
echo "  - Database: Running on internal network"
echo "  - Server: Running on internal network"
echo "  - Client: Running on internal network"
echo "  - Nginx: https://$DOMAIN_NAME"
echo ""
echo "View logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
