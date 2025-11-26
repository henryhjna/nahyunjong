#!/bin/bash
#
# Quick Deployment Script
# This follows DEPLOYMENT.md Part 5: Updating the Application
# 
# Prerequisites:
# - Images already built locally (nahyunjong-client:latest, nahyunjong-server:latest)
# - AWS credentials in ~/.aws/credentials
# - SSH key at c:/projects/nahyunjong/nahyunjong-key.pem
#
# Usage: ./scripts/quick-deploy.sh

set -e

echo "==========================================="
echo "Quick Deploy - Login → Tag → Push → Deploy"
echo "==========================================="
echo ""

# Configuration from DEPLOYMENT.md
AWS_ACCOUNT_ID="025158345480"
AWS_REGION="ap-northeast-2"
ECR_CLIENT="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/nahyunjong-client"
ECR_SERVER="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/nahyunjong-server"
EC2_IP="52.78.127.98"
EC2_USER="ubuntu"
EC2_KEY="c:/projects/nahyunjong/nahyunjong-key.pem"

# Step 1: Login to ECR using Docker image with AWS CLI
# (This avoids needing AWS CLI installed locally)
echo "Step 1/4: Login to ECR (local)..."

# Read AWS credentials
if [ ! -f ~/.aws/credentials ]; then
    echo "ERROR: AWS credentials file not found at ~/.aws/credentials"
    exit 1
fi

ACCESS_KEY=$(grep aws_access_key_id ~/.aws/credentials | head -1 | cut -d= -f2 | tr -d ' ')
SECRET_KEY=$(grep aws_secret_access_key ~/.aws/credentials | head -1 | cut -d= -f2 | tr -d ' ')

if [ -z "$ACCESS_KEY" ] || [ -z "$SECRET_KEY" ]; then
    echo "ERROR: Failed to load AWS credentials"
    exit 1
fi

# Get ECR login password and login to Docker
docker run --rm \
    -e AWS_ACCESS_KEY_ID="$ACCESS_KEY" \
    -e AWS_SECRET_ACCESS_KEY="$SECRET_KEY" \
    -e AWS_DEFAULT_REGION="$AWS_REGION" \
    amazon/aws-cli ecr get-login-password --region $AWS_REGION \
    | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

if [ $? -ne 0 ]; then
    echo "ERROR: ECR login failed"
    exit 1
fi
echo "✓ Logged in to ECR"

# Step 2: Tag images for ECR
echo ""
echo "Step 2/4: Tagging images..."
docker tag nahyunjong-client:latest $ECR_CLIENT:latest
docker tag nahyunjong-server:latest $ECR_SERVER:latest
echo "✓ Images tagged"

# Step 3: Push to ECR
echo ""
echo "Step 3/4: Pushing to ECR (may take a few minutes)..."
echo "  Pushing client..."
docker push $ECR_CLIENT:latest
echo "  Pushing server..."
docker push $ECR_SERVER:latest
echo "✓ Images pushed to ECR"

# Step 4: Deploy on EC2
echo ""
echo "Step 4/4: Deploying on EC2..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP bash << ENDSSH
    set -e
    cd nahyunjong
    
    echo "  Logging in to ECR on EC2..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    echo "  Pulling latest images from ECR..."
    docker compose -f docker-compose.prod-ecr.yml pull
    
    echo "  Restarting services..."
    docker compose -f docker-compose.prod-ecr.yml up -d
    
    echo "  ✓ Services restarted"
ENDSSH

echo ""
echo "==========================================="
echo "✓ Deployment completed successfully!"
echo "==========================================="
echo ""
echo "Website: http://$EC2_IP"
echo ""
echo "View logs:"
echo "  ssh -i \"$EC2_KEY\" $EC2_USER@$EC2_IP"
echo "  cd nahyunjong && docker compose -f docker-compose.prod-ecr.yml logs -f"
echo "==========================================="
