# Terraform Infrastructure for nahyunjong

This directory contains Terraform configuration for deploying the nahyunjong application infrastructure on AWS.

## Infrastructure Components

- **VPC**: Isolated network with public and private subnets across 2 AZs
- **EC2**: t3.medium instance running Docker containers
- **RDS**: PostgreSQL 16 database (db.t4g.micro)
- **Route53**: DNS management for nahyunjong.com and nahyunjong.co.kr
- **S3**: Backup storage and Terraform state
- **Security Groups**: Firewall rules for EC2, RDS, and ALB
- **IAM**: Roles and policies for EC2 instance
- **CloudWatch**: Monitoring and alarms

## Prerequisites

1. AWS CLI configured with credentials
2. Terraform >= 1.0 installed
3. EC2 key pair created
4. Domain names registered

## Quick Start

```bash
# 1. Initialize backend (first time only)
aws s3api create-bucket \
  --bucket nahyunjong-terraform-state \
  --region ap-northeast-2 \
  --create-bucket-configuration LocationConstraint=ap-northeast-2

aws dynamodb create-table \
  --table-name nahyunjong-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# 2. Configure variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Edit with your values

# 3. Initialize Terraform
terraform init

# 4. Plan infrastructure
terraform plan

# 5. Apply (create infrastructure)
terraform apply

# 6. View outputs
terraform output
```

## Files

- `main.tf` - Provider and backend configuration
- `variables.tf` - Variable definitions
- `vpc.tf` - VPC, subnets, routing
- `security_groups.tf` - Security group rules
- `ec2.tf` - EC2 instance configuration
- `rds.tf` - PostgreSQL database
- `route53.tf` - DNS records and health checks
- `s3.tf` - S3 buckets for backups and state
- `outputs.tf` - Output values
- `terraform.tfvars` - Your variable values (not committed)

## Important Variables

Edit `terraform.tfvars`:

```hcl
ec2_key_name = "nahyunjong-key"  # Your EC2 key pair name
db_password = "your-secure-password"  # Database password
allowed_ssh_cidr = ["your.ip.address/32"]  # Your IP for SSH
```

## Outputs

After `terraform apply`, important values are displayed:

```bash
# Get EC2 IP
terraform output ec2_public_ip

# Get RDS endpoint
terraform output rds_endpoint

# Get Route53 nameservers
terraform output route53_nameservers_com
terraform output route53_nameservers_kr

# Get all outputs
terraform output
```

## State Management

Terraform state is stored in:
- **S3 Bucket**: nahyunjong-terraform-state
- **DynamoDB Table**: nahyunjong-terraform-locks (for locking)

This allows team collaboration and prevents concurrent modifications.

## Updating Infrastructure

```bash
# Pull latest changes
git pull

# Review changes
terraform plan

# Apply changes
terraform apply
```

## Destroying Infrastructure

**WARNING**: This will delete all resources!

```bash
# Preview what will be destroyed
terraform plan -destroy

# Destroy everything
terraform destroy
```

## Cost Optimization

Current configuration uses:
- EC2 t3.medium (~$30/month) - can downgrade to t3.small for testing
- RDS db.t4g.micro (Free tier eligible / ~$15/month)
- S3 minimal usage (~$1-5/month)
- Route53 $1/zone/month

To reduce costs:
- Use smaller instance types for dev/test
- Use RDS free tier
- Delete unused snapshots and backups

## Security Best Practices

1. **SSH Access**: Limit `allowed_ssh_cidr` to your IP only
2. **Database**: Strong password, no public access
3. **RDS Encryption**: Enabled by default
4. **Backups**: 7-day retention enabled
5. **IAM**: Least privilege access for EC2 role

## Monitoring

CloudWatch alarms are automatically created for:
- RDS CPU > 80%
- RDS free storage < 5 GB
- Route53 health check failures

View alarms in AWS Console → CloudWatch → Alarms

## Troubleshooting

### State lock errors

```bash
# If state is locked (e.g., previous apply was interrupted)
terraform force-unlock <lock-id>
```

### Backend errors

```bash
# Re-initialize backend
terraform init -reconfigure
```

### Resource already exists

```bash
# Import existing resource
terraform import aws_instance.app i-1234567890abcdef0
```

## Multi-Environment Setup

To create separate environments (dev, staging, prod):

1. Create separate workspaces:
```bash
terraform workspace new dev
terraform workspace new staging
terraform workspace new production
```

2. Or use separate tfvars files:
```bash
terraform apply -var-file="dev.tfvars"
terraform apply -var-file="prod.tfvars"
```

## References

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS VPC Best Practices](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-best-practices.html)
- [RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
