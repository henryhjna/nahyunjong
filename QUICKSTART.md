# Quick Start Guide

This is a streamlined deployment guide. For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Prerequisites

- AWS Account
- AWS CLI installed: `aws --version`
- Terraform installed: `terraform --version`
- Domain names registered (nahyunjong.com, nahyunjong.co.kr)

## 1. AWS Setup (5 minutes)

```bash
# Configure AWS credentials
aws configure

# Create EC2 key pair
aws ec2 create-key-pair \
  --key-name nahyunjong-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/nahyunjong-key.pem

chmod 400 ~/.ssh/nahyunjong-key.pem
```

## 2. Create Terraform Backend (5 minutes)

```bash
# Create S3 bucket for state
aws s3api create-bucket \
  --bucket nahyunjong-terraform-state \
  --region ap-northeast-2 \
  --create-bucket-configuration LocationConstraint=ap-northeast-2

aws s3api put-bucket-versioning \
  --bucket nahyunjong-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB for locking
aws dynamodb create-table \
  --table-name nahyunjong-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-2
```

## 3. Deploy Infrastructure (15 minutes)

```bash
cd terraform

# Configure variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Initialize and apply
terraform init
terraform plan
terraform apply

# Save outputs
terraform output > ../terraform-outputs.txt
```

## 4. Update DNS Nameservers

Go to your domain registrar and update nameservers:

```bash
# Get nameservers
terraform output route53_nameservers_com
terraform output route53_nameservers_kr
```

## 5. Deploy Application (20 minutes)

```bash
# Get EC2 IP
EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)

# SSH to EC2
ssh -i ~/.ssh/nahyunjong-key.pem ubuntu@$EC2_IP

# On EC2: Clone repository
cd /home/ubuntu
git clone https://github.com/henryhjna/nahyunjong.git
cd nahyunjong

# Create environment file
cp .env.production.example .env.production
nano .env.production  # Fill in all values

# Clone content repository
cd /home/ubuntu
git clone <your-content-repo-url> nahyunjong-content

# Build and start
cd /home/ubuntu/nahyunjong
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Setup SSL
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh nahyunjong.com na.hyunjong@gmail.com
```

## 6. Verify

```bash
# Check services
docker compose -f docker-compose.prod.yml ps

# Test website
curl https://nahyunjong.com
```

## Daily Operations

### View Logs
```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Deploy Updates
```bash
./scripts/deploy.sh
```

### Backup Database
```bash
./scripts/backup-db.sh
```

### Restore Database
```bash
./scripts/restore-db.sh /home/ubuntu/backups/backup-file.sql.gz
```

## Environment Variables Checklist

Required in `.env.production`:

- [ ] `DB_HOST` - From Terraform output
- [ ] `DB_PASSWORD` - Strong password
- [ ] `JWT_SECRET` - Generate: `openssl rand -base64 64`
- [ ] `ANTHROPIC_API_KEY` - From https://console.anthropic.com/
- [ ] `NEXT_PUBLIC_API_URL` - https://nahyunjong.com/api
- [ ] All other variables from `.env.production.example`

## Cost

Approximate monthly cost: **$35-50**

- EC2 t3.medium: ~$30
- RDS db.t4g.micro: ~$15 (Free tier eligible)
- S3 + Route53: ~$5

## Support

- Detailed guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Terraform docs: [terraform/README.md](./terraform/README.md)
- Issues: Contact na.hyunjong@gmail.com
