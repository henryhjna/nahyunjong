# Security Guidelines

This document outlines security best practices for the nahyunjong project.

## Credentials Management

### Never Commit Sensitive Data

**NEVER commit the following to git:**
- AWS access keys (AKIA...)
- AWS secret keys
- Database passwords
- JWT secrets
- API keys (Anthropic, etc.)
- Private keys (.pem, .key)
- Environment files (.env.production)

### .gitignore Protection

The following files are protected by `.gitignore`:
```
.env
.env.local
.env.*.local
.env.production
*.pem
*.key
terraform.tfvars
terraform.tfstate
```

**Always verify before committing:**
```bash
git status
git diff --cached
```

## AWS Credentials

### Local Development

Configure AWS CLI with your credentials:
```bash
aws configure
# Enter: AWS Access Key ID
# Enter: AWS Secret Access Key
# Enter: Default region: ap-northeast-2
# Enter: Default output format: json
```

### Using Environment Variables

For scripts that need AWS credentials:
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=ap-northeast-2
```

### EC2 Instance

Use IAM roles instead of hardcoded credentials:
- Attach IAM role to EC2 instance
- Grant permissions: ECR pull, RDS access, S3 access
- No need to configure `aws configure` on EC2

## Environment Variables

### Local Development (.env.local)

```bash
# Development database
DB_HOST=localhost
DB_PORT=7342
DB_NAME=nahyunjong_db
DB_USER=postgres
DB_PASSWORD=dev_password_here

# Development server
NODE_ENV=development
JWT_SECRET=dev_jwt_secret_here

# Local API
NEXT_PUBLIC_API_URL=http://localhost:7341
```

### Production (.env.production)

Create from example:
```bash
cp .env.production.example .env.production
nano .env.production
```

**Required values:**
1. **Strong passwords**: Use `openssl rand -base64 32`
2. **JWT Secret**: Use `openssl rand -base64 64`
3. **RDS endpoint**: From Terraform output
4. **Anthropic API key**: From https://console.anthropic.com/

## Database Security

### PostgreSQL

**Production RDS:**
- Strong password (32+ characters, random)
- Not publicly accessible (private subnet only)
- Security group: Allow EC2 only
- Encryption at rest enabled
- Automated backups enabled
- Multi-AZ for high availability

**Connection string (never log this):**
```bash
postgresql://username:password@endpoint:5432/dbname
```

### Backup Security

Backups contain sensitive data:
```bash
# Encrypt backups before uploading to S3
gpg --encrypt backup.sql.gz

# Decrypt when restoring
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```

## API Keys

### Anthropic API Key

Store in environment variables only:
```bash
# .env.production
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Never:
- Log API keys
- Include in error messages
- Send to client-side code
- Commit to git

## JWT Secrets

Generate strong JWT secret:
```bash
openssl rand -base64 64
```

Properties:
- At least 64 characters
- Randomly generated
- Never reuse across environments
- Rotate periodically (every 90 days)

## SSL/TLS

### Let's Encrypt Certificates

Automatic renewal configured via certbot:
```yaml
# docker-compose.prod.yml
certbot:
  entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

### Nginx SSL Configuration

Strong ciphers only:
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
```

## Security Headers

Nginx adds security headers:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

## SSH Access

### EC2 SSH Key

Protect your private key:
```bash
chmod 400 ~/.ssh/nahyunjong-key.pem
```

Never:
- Commit .pem files to git
- Share private keys via email/chat
- Use weak passwords for key encryption

### Allowed IPs

Update security group to restrict SSH:
```terraform
# terraform/variables.tf
variable "allowed_ssh_cidr" {
  default = ["YOUR_IP/32"]  # Replace 0.0.0.0/0 with your IP
}
```

## Docker Security

### Production Images

Multi-stage builds minimize attack surface:
```dockerfile
FROM node:20-alpine AS builder
# ... build ...

FROM node:20-alpine AS runner
# Only copy built artifacts
```

### Non-root User

All containers run as non-root:
```dockerfile
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
USER nextjs
```

## Terraform State

### Remote State (Encrypted)

```terraform
backend "s3" {
  bucket         = "nahyunjong-terraform-state"
  key            = "terraform.tfstate"
  region         = "ap-northeast-2"
  encrypt        = true
  dynamodb_table = "nahyunjong-terraform-locks"
}
```

State files contain sensitive data:
- RDS passwords
- Security group IDs
- Private IPs

### State Locking

DynamoDB prevents concurrent modifications:
- Prevents race conditions
- Ensures state consistency

## Incident Response

### Compromised Credentials

If AWS credentials are exposed:
1. **Immediately** disable the access key in AWS Console
2. Generate new access key
3. Update local `aws configure`
4. Rotate all related secrets (DB passwords, JWT secrets)
5. Review CloudTrail logs for unauthorized access
6. Update Terraform state if needed

### Compromised Database

If database password is exposed:
1. Change RDS password immediately
2. Update `.env.production` on EC2
3. Restart services
4. Review database logs for suspicious queries
5. Consider restoring from backup if data integrity is questionable

### Compromised API Keys

If Anthropic API key is exposed:
1. Revoke key at https://console.anthropic.com/
2. Generate new API key
3. Update `.env.production`
4. Restart client service
5. Monitor usage for billing anomalies

## Security Checklist

Before deployment:
- [ ] No credentials in git history: `git log -p | grep -i "akia\|password\|secret"`
- [ ] .gitignore includes all sensitive files
- [ ] Strong passwords generated (32+ chars)
- [ ] JWT secret generated (64+ chars)
- [ ] AWS credentials removed from scripts
- [ ] SSH allowed IP restricted (not 0.0.0.0/0)
- [ ] RDS not publicly accessible
- [ ] SSL certificates configured
- [ ] Security headers enabled in Nginx
- [ ] Containers run as non-root users
- [ ] Terraform state encrypted

After deployment:
- [ ] Change default admin password
- [ ] Test HTTPS access
- [ ] Verify security headers: https://securityheaders.com/
- [ ] Run SSL test: https://www.ssllabs.com/ssltest/
- [ ] Enable AWS CloudWatch alarms
- [ ] Setup automated backups
- [ ] Document emergency contacts

## Monitoring

### AWS CloudWatch

Monitor for suspicious activity:
- Failed login attempts
- Unusual API usage
- High network traffic
- Database query patterns

### Logs

Sensitive data NEVER in logs:
```typescript
// ❌ BAD
console.log('User password:', password);
console.log('JWT token:', token);

// ✅ GOOD
console.log('User authenticated:', userId);
console.log('Token validated for user:', userId);
```

## Compliance

### Data Protection

- User data encrypted at rest (RDS)
- User data encrypted in transit (SSL/TLS)
- Regular backups (daily)
- Backup retention (30 days)

### Access Control

- Principle of least privilege
- Admin-only access to production
- Audit logs enabled
- Regular access reviews

## Contact

Security concerns: na.hyunjong@gmail.com

**Report security vulnerabilities immediately. Do not disclose publicly until patch is available.**
