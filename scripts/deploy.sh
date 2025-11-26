#!/bin/bash
# =============================================================================
# Nahyunjong Production Deployment Script
# =============================================================================
# This is the ONLY way to deploy. Do NOT run docker commands manually.
# Usage: make deploy (or ./scripts/deploy.sh)
# =============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variable

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# =============================================================================
# Step 0: Load Environment Variables
# =============================================================================
log_info "Loading environment variables from .env..."

if [ ! -f .env ]; then
    log_error ".env file not found!"
    log_error "Copy .env.example to .env and fill in your values"
    exit 1
fi

# Load .env file
set -a
source .env
set +a

log_success "Environment variables loaded"

# =============================================================================
# Step 1: Prerequisite Checks
# =============================================================================
log_info "Running prerequisite checks..."

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi
log_success "Docker is running"

# Check AWS credentials
if [ ! -f ~/.aws/credentials ]; then
    log_error "AWS credentials not found at ~/.aws/credentials"
    log_error "Run 'aws configure' or create the file manually"
    exit 1
fi

ACCESS_KEY=$(grep aws_access_key_id ~/.aws/credentials | head -1 | cut -d= -f2 | tr -d ' ')
SECRET_KEY=$(grep aws_secret_access_key ~/.aws/credentials | head -1 | cut -d= -f2 | tr -d ' ')

if [ -z "$ACCESS_KEY" ] || [ -z "$SECRET_KEY" ]; then
    log_error "AWS credentials are empty in ~/.aws/credentials"
    exit 1
fi
log_success "AWS credentials found"

# Check SSH key
if [ ! -f "$EC2_KEY_PATH" ]; then
    log_error "EC2 SSH key not found at: $EC2_KEY_PATH"
    exit 1
fi
log_success "EC2 SSH key found"

# Check required env vars
REQUIRED_VARS=(
    "AWS_REGION"
    "AWS_ACCOUNT_ID"
    "ECR_REGISTRY"
    "EC2_HOST"
    "EC2_USER"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        log_error "Required environment variable $var is not set in .env"
        exit 1
    fi
done
log_success "All required environment variables are set"

log_success "All prerequisite checks passed!"
echo ""

# =============================================================================
# Step 2: Build Docker Images
# =============================================================================
log_info "Building Docker images..."

log_info "  Building client..."
cd client
docker build -f Dockerfile.prod -t nahyunjong-client:latest . --quiet
cd ..
log_success "  Client built"

log_info "  Building server..."
cd server
docker build -f Dockerfile.prod -t nahyunjong-server:latest . --quiet
cd ..
log_success "  Server built"

log_success "Docker images built successfully"
echo ""

# =============================================================================
# Step 3: Login to ECR
# =============================================================================
log_info "Logging in to AWS ECR..."

docker run --rm \
    -e AWS_ACCESS_KEY_ID="$ACCESS_KEY" \
    -e AWS_SECRET_ACCESS_KEY="$SECRET_KEY" \
    -e AWS_DEFAULT_REGION="$AWS_REGION" \
    amazon/aws-cli ecr get-login-password --region $AWS_REGION \
    | docker login --username AWS --password-stdin "$ECR_REGISTRY" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    log_error "ECR login failed"
    exit 1
fi

log_success "Logged in to ECR"
echo ""

# =============================================================================
# Step 4: Tag Images for ECR
# =============================================================================
log_info "Tagging images for ECR..."

ECR_CLIENT="$ECR_REGISTRY/nahyunjong-client"
ECR_SERVER="$ECR_REGISTRY/nahyunjong-server"

docker tag nahyunjong-client:latest $ECR_CLIENT:latest
docker tag nahyunjong-server:latest $ECR_SERVER:latest

log_success "Images tagged"
echo ""

# =============================================================================
# Step 5: Push Images to ECR
# =============================================================================
log_info "Pushing images to ECR (this may take a few minutes)..."

log_info "  Pushing client..."
docker push $ECR_CLIENT:latest > /dev/null 2>&1
log_success "  Client pushed"

log_info "  Pushing server..."
docker push $ECR_SERVER:latest > /dev/null 2>&1
log_success "  Server pushed"

log_success "Images pushed to ECR"
echo ""

# =============================================================================
# Step 6: Deploy on EC2
# =============================================================================
log_info "Deploying on EC2..."

ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no -o LogLevel=ERROR $EC2_USER@$EC2_HOST bash << ENDSSH
    set -e
    cd nahyunjong
    
    echo "  [EC2] Logging in to ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY > /dev/null 2>&1
    
    echo "  [EC2] Pulling latest images..."
    docker compose -f docker-compose.prod-ecr.yml pull > /dev/null 2>&1
    
    echo "  [EC2] Restarting services..."
    docker compose -f docker-compose.prod-ecr.yml up -d > /dev/null 2>&1
    
    echo "  [EC2] Deployment complete"
ENDSSH

log_success "Deployment completed on EC2"
echo ""

# =============================================================================
# Final Summary
# =============================================================================
echo "========================================="
log_success "DEPLOYMENT SUCCESSFUL!"
echo "========================================="
echo ""
echo "Website: http://$EC2_HOST"
echo ""
echo "To view logs:"
echo "  ssh -i \"$EC2_KEY_PATH\" $EC2_USER@$EC2_HOST"
echo "  cd nahyunjong && docker compose -f docker-compose.prod-ecr.yml logs -f"
echo ""
echo "========================================="
