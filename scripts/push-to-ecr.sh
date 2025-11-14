#!/bin/bash

# AWS ECR Push Script
# This script tags and pushes Docker images to AWS ECR
#
# Prerequisites:
# - AWS CLI configured with credentials (run: aws configure)
# - Or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables

set -e

# AWS Configuration
AWS_REGION="${AWS_REGION:-ap-northeast-2}"
ECR_REGISTRY="${ECR_REGISTRY:-025158345480.dkr.ecr.ap-northeast-2.amazonaws.com}"
CLIENT_REPO="$ECR_REGISTRY/nahyunjong-client"
SERVER_REPO="$ECR_REGISTRY/nahyunjong-server"

echo "==========================================="
echo "Pushing Docker Images to AWS ECR"
echo "==========================================="

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo "ERROR: AWS credentials not configured!"
    echo "Please run 'aws configure' or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
    exit 1
fi

echo "✓ AWS credentials verified"

# Step 1: Get ECR login password and login to Docker
echo ""
echo "Step 1: Logging in to AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to login to ECR. Make sure AWS CLI is installed."
    exit 1
fi

echo "✓ Successfully logged in to ECR"

# Step 2: Tag images
echo ""
echo "Step 2: Tagging images..."
docker tag nahyunjong-client:latest $CLIENT_REPO:latest
docker tag nahyunjong-server:latest $SERVER_REPO:latest

echo "✓ Images tagged successfully"

# Step 3: Push images to ECR
echo ""
echo "Step 3: Pushing images to ECR (this may take a few minutes)..."

echo "Pushing client image..."
docker push $CLIENT_REPO:latest

echo ""
echo "Pushing server image..."
docker push $SERVER_REPO:latest

echo ""
echo "==========================================="
echo "✓ All images pushed successfully!"
echo "==========================================="
echo ""
echo "ECR Repositories:"
echo "  Client: $CLIENT_REPO:latest"
echo "  Server: $SERVER_REPO:latest"
echo ""
echo "Next step: Deploy on EC2"
echo "  ssh -i terraform/nahyunjong-key.pem ubuntu@52.78.127.98"
echo "==========================================="
