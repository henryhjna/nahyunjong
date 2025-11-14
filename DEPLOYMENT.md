# Deployment Guide - AWS ECR with Terraform

This guide describes the production-ready deployment process using **Terraform**, **AWS ECR**, and **Git** for the nahyunjong project.

## Overview

**Deployment Strategy**: Terraform Infrastructure → Local Build → ECR Push → Git Push → EC2 Pull & Deploy

```
[Terraform]
      ↓
  AWS Infrastructure Setup
  (EC2, ECR, RDS, etc.)
      ↓
[Local Development]
      ↓
  Build Images with docker-compose
      ↓
  Push to ECR (created by Terraform)
      ↓
  Push source code to Git
      ↓
[EC2 Production]
      ↓
  Pull source code from Git
      ↓
  Pull updated images from ECR
      ↓
  Deploy with docker-compose
```

## Why This Architecture?

- **Infrastructure as Code**: Terraform manages all AWS resources
- **Private Registry**: ECR provides secure, private container storage
- **Version Control**: Git tracks source code changes, ECR tracks image versions
- **Cost Effective**: ECR free tier: 500MB storage/month for 12 months
- **Fast Deployment**: No rebuild on production server
- **Consistency**: Same images from dev to prod
- **Source Tracking**: Git commits document what changed and when

## Prerequisites

1. **AWS Account**
   - AWS CLI installed and configured
   - IAM user with appropriate permissions

2. **Terraform**
   - Terraform installed (v1.0+)
   - Used to provision: EC2, ECR, RDS, VPC, Security Groups, etc.

3. **Docker & Docker Compose**
   - Docker Desktop installed locally
   - Used for building images

4. **Git Repository**
   - GitHub repository for source code
   - Repository: `henryhjna/nahyunjong`

5. **SSH Key**
   - Generated during Terraform apply
   - `nahyunjong-key.pem` for EC2 access

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                ┌──────▼──────┐
                │   Route53   │
                │  DNS + HC   │
                └──────┬──────┘
                       │
                ┌──────▼──────┐
                │    Nginx    │
                │ (SSL/TLS)   │
                └──────┬──────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼────┐                 ┌────▼────┐
    │  Next.js│                 │ Express │
    │  Client │◄────────────────┤  Server │
    └────┬────┘                 └────┬────┘
         │                           │
         │                      ┌────▼────┐
         │                      │   RDS   │
         │                      │PostgreSQL
         │                      └─────────┘
         │
    ┌────▼────┐
    │   S3    │
    │ Backups │
    └─────────┘
```

---

## Part 1: Terraform Infrastructure Setup

### Step 1: Initialize Terraform

```bash
cd c:/projects/nahyunjong/terraform

# Initialize Terraform (download providers)
terraform init

# Review what will be created
terraform plan
```

### Step 2: Apply Terraform Configuration

```bash
# Create all AWS infrastructure
terraform apply

# Type 'yes' when prompted
```

**This creates:**
- VPC with public/private subnets
- Security groups (EC2, RDS)
- EC2 instance (t3.micro)
- RDS PostgreSQL (db.t4g.micro)
- ECR repositories (client, server)
- Route53 DNS records
- IAM roles and policies

**Expected Output:**
```
Apply complete! Resources: 15 added, 0 changed, 0 destroyed.

Outputs:
ec2_public_ip = "52.78.127.98"
ecr_client_repository_url = "123456789.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-client"
ecr_server_repository_url = "123456789.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-server"
rds_endpoint = "nahyunjong-db.xxxxx.ap-northeast-2.rds.amazonaws.com"
```

**Save these outputs** - you'll need them for the next steps.

### Step 3: Save SSH Key

```bash
# Terraform generates nahyunjong-key.pem in the project root
# Move it to a safe location
mv nahyunjong-key.pem ~/.ssh/
chmod 400 ~/.ssh/nahyunjong-key.pem
```

---

## Part 2: Local Build and Push to ECR

### Step 1: Login to ECR

```bash
# Get ECR login command from Terraform output
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# Example:
# aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 123456789.dkr.ecr.ap-northeast-2.amazonaws.com
```

**Expected Output:**
```
Login Succeeded
```

### Step 2: Build Production Images

```bash
cd c:/projects/nahyunjong

# Build all production images using docker-compose
docker-compose -f docker-compose.prod.yml build

# This builds:
# - nahyunjong-client (Next.js)
# - nahyunjong-server (Express)
```

**Expected Output:**
```
✓ Service server Built
✓ Service client Built
```

### Step 3: Tag Images for ECR

Use the ECR repository URLs from Terraform output:

```bash
# Set variables (replace with your Terraform outputs)
ECR_CLIENT=<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-client
ECR_SERVER=<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-server

# Tag client image
docker tag nahyunjong-client:latest $ECR_CLIENT:latest
docker tag nahyunjong-client:latest $ECR_CLIENT:v1.0.0

# Tag server image
docker tag nahyunjong-server:latest $ECR_SERVER:latest
docker tag nahyunjong-server:latest $ECR_SERVER:v1.0.0
```

### Step 4: Push Images to ECR

```bash
# Push client
docker push $ECR_CLIENT:latest
docker push $ECR_CLIENT:v1.0.0

# Push server
docker push $ECR_SERVER:latest
docker push $ECR_SERVER:v1.0.0
```

**Expected Output:**
```
The push refers to repository [123456789.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-client]
...
latest: digest: sha256:... size: ...
```

### Step 5: Push Source Code to Git

```bash
cd c:/projects/nahyunjong

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add new feature X"

# Push to GitHub
git push origin master
```

**Why push source code?**
- Document what changed
- EC2 needs source code for docker-compose.yml and config files
- Enables version tracking and rollback

---

## Part 3: EC2 Deployment from ECR

### Step 1: SSH into EC2

```bash
# Get EC2 IP from Terraform output
ssh -i ~/.ssh/nahyunjong-key.pem ubuntu@<EC2_PUBLIC_IP>

# Example:
ssh -i ~/.ssh/nahyunjong-key.pem ubuntu@52.78.127.98
```

### Step 2: Install Docker and Docker Compose (if not done by Terraform)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes to take effect
exit

# SSH back in
ssh -i ~/.ssh/nahyunjong-key.pem ubuntu@<EC2_PUBLIC_IP>

# Verify installations
docker --version
docker-compose --version
```

### Step 3: Configure AWS CLI and ECR Login

```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure AWS credentials (use IAM user with ECR access)
aws configure

# Login to ECR
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com
```

### Step 4: Clone Repository on EC2

```bash
cd /home/ubuntu

# Clone repository (contains docker-compose files and configs)
git clone https://github.com/henryhjna/nahyunjong.git
cd nahyunjong
```

### Step 5: Create Production Environment File

```bash
# Create .env.production using RDS endpoint from Terraform
nano .env.production
```

**Copy and paste these values** (use Terraform outputs):

```bash
# Database (RDS PostgreSQL - from Terraform output)
DB_HOST=<rds_endpoint_from_terraform>
DB_PORT=5432
DB_NAME=nahyunjong_db
DB_USER=postgres
DB_PASSWORD=<your-rds-password>

# Server
PORT=7341
NODE_ENV=production
JWT_SECRET=<your-jwt-secret>

# Client
NEXT_PUBLIC_API_URL=http://<EC2_PUBLIC_IP>:7341

# Admin
ADMIN_EMAIL=na.hyunjong@gmail.com
ADMIN_USERNAME=nahyunjong

# Anthropic API Key (for AI story generation)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Generate JWT Secret:**
```bash
openssl rand -base64 64
```

**Save and exit**: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 6: Update docker-compose.prod.yml with ECR URLs

The repository should already have `docker-compose.prod.yml`. Update it to use ECR image URLs:

```bash
nano docker-compose.prod.yml
```

**Update the image fields** (replace with your ECR URLs from Terraform):

```yaml
services:
  server:
    image: <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-server:latest
    # ... rest of config

  client:
    image: <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-client:latest
    # ... rest of config
```

### Step 7: Clone Content Repository

The unfold-story content needs to be available:

```bash
cd /home/ubuntu
git clone <your-nahyunjong-content-repo-url> nahyunjong-content
```

### Step 8: Pull Images from ECR and Start Services

```bash
cd /home/ubuntu/nahyunjong

# Pull latest images from ECR
docker-compose -f docker-compose.prod.yml pull

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Expected Output:**
```
✓ Container nahyunjong-db-prod      Started
✓ Container nahyunjong-server-prod  Started
✓ Container nahyunjong-client-prod  Started
✓ Container nahyunjong-nginx        Started
✓ Container nahyunjong-certbot      Started
```

### Step 9: Verify Deployment

```bash
# Check all containers are running
docker ps

# Test server health
curl http://localhost:7341/api/health

# Test client
curl http://localhost:7340

# Test external access
curl http://52.78.127.98
```

---

## Part 4: SSL Setup with Let's Encrypt

### Step 1: Configure Nginx for SSL

```bash
cd /home/ubuntu/nahyunjong
nano nginx/conf.d/default.conf
```

**Update configuration** to support SSL (detailed config in nginx docs)

### Step 2: Obtain SSL Certificates

```bash
# Make init script executable
chmod +x scripts/init-ssl.sh

# Initialize SSL for nahyunjong.com
./scripts/init-ssl.sh nahyunjong.com na.hyunjong@gmail.com

# If you want nahyunjong.co.kr to have its own certificate:
./scripts/init-ssl.sh nahyunjong.co.kr na.hyunjong@gmail.com
```

### Step 3: Restart Nginx

```bash
docker-compose -f docker-compose.ec2.yml restart nginx
```

### Step 4: Verify HTTPS

```bash
# Test HTTPS
curl https://nahyunjong.com

# Check certificate
openssl s_client -connect nahyunjong.com:443 -servername nahyunjong.com
```

---

## Part 5: Updating the Application

This is the **standard workflow** for deploying updates:

### On Local Machine

```bash
# 1. Make code changes
# ... edit files ...

# 2. Build images with docker-compose
cd c:/projects/nahyunjong
docker-compose -f docker-compose.prod.yml build

# 3. Login to ECR
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# 4. Tag with new version
ECR_CLIENT=<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-client
ECR_SERVER=<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-server

docker tag nahyunjong-client:latest $ECR_CLIENT:latest
docker tag nahyunjong-client:latest $ECR_CLIENT:v1.0.1
docker tag nahyunjong-server:latest $ECR_SERVER:latest
docker tag nahyunjong-server:latest $ECR_SERVER:v1.0.1

# 5. Push to ECR
docker push $ECR_CLIENT:latest
docker push $ECR_CLIENT:v1.0.1
docker push $ECR_SERVER:latest
docker push $ECR_SERVER:v1.0.1

# 6. Commit source code to Git (to document changes)
git add .
git commit -m "Update feature X"
git push origin master
```

### On EC2 Server

```bash
# SSH into EC2
ssh -i ~/.ssh/nahyunjong-key.pem ubuntu@<EC2_PUBLIC_IP>

cd /home/ubuntu/nahyunjong

# 1. Pull latest source code from Git
git pull origin master

# 2. Login to ECR (if session expired)
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# 3. Pull updated images from ECR
docker-compose -f docker-compose.prod.yml pull

# 4. Restart services with new images
docker-compose -f docker-compose.prod.yml up -d

# 5. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Or use the automated deploy script:**

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Summary:**
1. **Local**: Build → Push to ECR → Push to Git
2. **EC2**: Pull from Git → Pull from ECR → Deploy

---

## Part 6: Database Backups

### Setup Automatic Backups

```bash
# Make backup script executable
chmod +x scripts/backup-db.sh

# Test backup
./scripts/backup-db.sh

# Setup daily backup at 2 AM
crontab -e

# Add this line:
0 2 * * * cd /home/ubuntu/nahyunjong && ./scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

### Restore from Backup

```bash
# List available backups
ls -lh /home/ubuntu/backups/

# Restore from backup
./scripts/restore-db.sh /home/ubuntu/backups/nahyunjong_db_20240113_020000.sql.gz
```

---

## Monitoring and Logs

### View Logs

```bash
# All services
docker-compose -f docker-compose.ec2.yml logs -f

# Specific service
docker-compose -f docker-compose.ec2.yml logs -f client
docker-compose -f docker-compose.ec2.yml logs -f server
docker-compose -f docker-compose.ec2.yml logs -f nginx
```

### Check Service Status

```bash
# Docker containers
docker ps

# Service health
docker-compose -f docker-compose.ec2.yml ps
```

### CloudWatch Monitoring

Logs are automatically sent to AWS CloudWatch:
- Go to AWS Console → CloudWatch → Log Groups
- Find `/aws/ec2/nahyunjong`

---

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose -f docker-compose.ec2.yml logs

# Restart services
docker-compose -f docker-compose.ec2.yml restart

# Rebuild and restart
docker-compose -f docker-compose.ec2.yml up -d --force-recreate
```

### Database connection issues

```bash
# Test RDS connection from EC2
nc -zv nahyunjong-db.c9agokgagbtl.ap-northeast-2.rds.amazonaws.com 5432

# Check security group allows EC2 → RDS
# Verify DB_HOST, DB_PORT, DB_PASSWORD in .env.production
```

### Cannot pull images from ECR

```bash
# Login to ECR on EC2
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# Manually pull images
docker pull <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-client:latest
docker pull <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-server:latest
```

### SSL certificate issues

```bash
# Check certbot logs
docker-compose -f docker-compose.ec2.yml logs certbot

# Manually request certificate
docker-compose -f docker-compose.ec2.yml run --rm certbot \
  certonly --webroot --webroot-path=/var/www/certbot \
  -d nahyunjong.com -d www.nahyunjong.com \
  --email na.hyunjong@gmail.com --agree-tos
```

### Images are outdated

```bash
# Force pull latest
docker-compose -f docker-compose.prod.yml pull

# Remove old images
docker image prune -a
```

---

## Rollback to Previous Version

If a new deployment causes issues:

```bash
# On EC2
cd /home/ubuntu/nahyunjong

# Method 1: Pull specific version from ECR
ECR_CLIENT=<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-client
ECR_SERVER=<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-server

docker pull $ECR_CLIENT:v1.0.0
docker pull $ECR_SERVER:v1.0.0

# Tag as latest
docker tag $ECR_CLIENT:v1.0.0 $ECR_CLIENT:latest
docker tag $ECR_SERVER:v1.0.0 $ECR_SERVER:latest

# Restart services
docker-compose -f docker-compose.prod.yml up -d

# Method 2: Rollback Git and pull old code
git log --oneline  # Find commit hash
git checkout <commit-hash>
git pull origin master  # Or stay on old commit

# Then pull and restart
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## Cost Estimation

Monthly AWS costs (Free Tier):
- **EC2 t3.micro**: Free for 12 months (750 hrs/month)
- **RDS db.t4g.micro**: Free for 12 months (750 hrs/month)
- **ECR storage**: Free tier 500MB/month for 12 months (likely < $1)
- **S3 storage**: ~$1-5 (backups)
- **Route53 hosted zones**: $1 per zone ($2 total for .com and .co.kr)
- **Route53 health check**: $0.50/month
- **Data transfer**: Variable (usually < $5)

**Total**: ~$3.50-9/month (during free tier)
**After free tier**: ~$40-60/month

---

## Security Checklist

- [x] Strong database password set
- [x] JWT secret generated securely
- [x] SSH access limited to specific IP (Terraform security group)
- [x] SSL certificates installed and auto-renewing
- [x] Environment variables not committed to git
- [x] Database backups enabled
- [x] CloudWatch monitoring active
- [x] Security groups properly configured (HTTP/HTTPS from internet, RDS from EC2 only)
- [x] RDS deletion protection enabled

---

## Quick Reference Commands

### Terraform
```bash
# Initialize
cd terraform
terraform init

# Plan changes
terraform plan

# Apply infrastructure
terraform apply

# Destroy all resources (DANGER!)
terraform destroy
```

### Local Development
```bash
# Login to ECR
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# Build with docker-compose
docker-compose -f docker-compose.prod.yml build

# Tag for ECR
ECR_CLIENT=<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-client
ECR_SERVER=<AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com/nahyunjong-server

docker tag nahyunjong-client:latest $ECR_CLIENT:v1.0.X
docker tag nahyunjong-server:latest $ECR_SERVER:v1.0.X

# Push to ECR
docker push $ECR_CLIENT:v1.0.X
docker push $ECR_SERVER:v1.0.X

# Commit to Git
git add .
git commit -m "Update X"
git push origin master
```

### EC2 Production
```bash
# SSH
ssh -i ~/.ssh/nahyunjong-key.pem ubuntu@<EC2_PUBLIC_IP>

# Deploy
cd /home/ubuntu/nahyunjong
git pull origin master
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart
docker-compose -f docker-compose.prod.yml restart

# Stop
docker-compose -f docker-compose.prod.yml down
```

---

## Support

For issues:
- Check logs: `docker-compose logs`
- Review CloudWatch metrics
- Check AWS Service Health Dashboard
- Contact: na.hyunjong@gmail.com
