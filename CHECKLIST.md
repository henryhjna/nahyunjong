# Deployment Checklist

## ⚡ Quick Deploy Command

```bash
make deploy
```

**That's it. This is the ONLY way to deploy. Do NOT run any other commands.**

---

## 📋 Before First Deployment

### 1. Setup .env File

```bash
# Copy template
cp .env.example .env

# Edit with your actual values
nano .env
```

Required values:
- `DB_PASSWORD` - Strong database password
- `JWT_SECRET` - Generate with: `openssl rand -base64 64`
- `ANTHROPIC_API_KEY` - Your Anthropic API key

### 2. Setup AWS Credentials

Create `~/.aws/credentials`:

```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

### 3. Verify SSH Key

Ensure `nahyunjong-key.pem` exists in project root.

---

## ✅ Pre-Deployment Checklist

Run this before every deployment:

```bash
make check
```

This verifies:
- ✓ Docker is running
- ✓ AWS credentials exist
- ✓ .env file exists
- ✓ SSH key exists

---

## 🚀 Deployment Process

### Standard Deployment

```bash
make deploy
```

This automatically:
1. ✓ Runs prerequisite checks
2. ✓ Builds Docker images (client + server)
3. ✓ Logs in to AWS ECR
4. ✓ Tags images for ECR
5. ✓ Pushes images to ECR
6. ✓ SSHs to EC2
7. ✓ Pulls latest images on EC2
8. ✓ Restarts services

**Duration:** ~3-5 minutes

---

## 🔍 Monitoring

### View Production Logs

```bash
make logs
```

### Check Service Status

```bash
make status
```

### Manual SSH (if needed)

```bash
source .env
ssh -i "$EC2_KEY_PATH" $EC2_USER@$EC2_HOST
cd nahyunjong
docker compose -f docker-compose.prod-ecr.yml logs -f
```

---

## 🚫 Absolutely Forbidden

### ❌ DO NOT DO THESE:

1. **❌ Running docker commands manually**
   ```bash
   # WRONG - DO NOT DO THIS
   docker build ...
   docker push ...
   docker tag ...
   ```

2. **❌ Modifying deploy.sh**
   - The script is standardized
   - If it needs changes, discuss first
   - Never "quick fix" the deployment script

3. **❌ Changing credential locations**
   ```bash
   # WRONG - DO NOT DO THIS
   # Credentials must stay in ~/.aws/credentials
   export AWS_ACCESS_KEY_ID=...  # DO NOT
   ```

4. **❌ Skipping `make check`**
   ```bash
   # WRONG - DO NOT DO THIS
   bash scripts/deploy.sh  # Always use make deploy instead
   ```

5. **❌ Building on EC2**
   - Images are ALWAYS built locally
   - Then pushed to ECR
   - Then pulled by EC2
   - NEVER build on EC2

6. **❌ "One-time" different deployment**
   - No exceptions
   - No "just this once"
   - Always use `make deploy`

---

## 🐛 Troubleshooting

### Deployment Fails: AWS Login Error

**Symptom:**
```
[ERROR] ECR login failed
```

**Solution:**
1. Verify `~/.aws/credentials` exists
2. Check credentials are not empty
3. Run `make check` to verify

---

### Deployment Fails: Docker Not Running

**Symptom:**
```
[FAIL] Docker is not running
```

**Solution:**
1. Start Docker Desktop
2. Wait for Docker to fully start
3. Run `make check` again

---

### Deployment Fails: Missing .env

**Symptom:**
```
[ERROR] .env file not found
```

**Solution:**
```bash
cp .env.example .env
# Edit .env with your values
make check
```

---

### Services Unhealthy on EC2

**Symptom:**
```
Container nahyunjong-server-prod is unhealthy
```

**Solution:**
1. Check EC2 logs:
   ```bash
   make logs
   ```

2. Most common causes:
   - Database password mismatch
   - Missing environment variables on EC2
   - Port conflicts

3. Verify EC2 .env file exists:
   ```bash
   ssh -i nahyunjong-key.pem ubuntu@52.78.127.98
   cat nahyunjong/.env
   ```

---

### Images Not Updating on EC2

**Symptom:**
Code changes not reflected after deployment

**Solution:**
This should NEVER happen if using `make deploy`. If it does:

1. Verify images pushed to ECR:
   ```bash
   # Check last push time in AWS Console → ECR
   ```

2. Verify EC2 pulled latest:
   ```bash
   make logs | grep "Pull complete"
   ```

3. If still not working, check deploy.sh ran all steps successfully

---

## 📚 Additional Commands

### Local Development

```bash
make dev          # Start local environment
make clean        # Stop and clean up
make build        # Build images only (no deploy)
```

### Production Management

```bash
make deploy       # Full deployment
make check        # Verify prerequisites
make logs         # View production logs
make status       # Check service status
```

---

## 🔐 Security Reminders

1. **Never commit:**
   - `.env` file
   - `nahyunjong-key.pem`
   - AWS credentials

2. **Git tracked (safe to commit):**
   - `.env.example`
   - `Makefile`
   - `scripts/deploy.sh`
   - `CHECKLIST.md`

3. **Credentials locations (only these):**
   - AWS: `~/.aws/credentials`
   - Environment: `.env` (gitignored)
   - SSH Key: `nahyunjong-key.pem` (gitignored)

---

## 📞 Support

If deployment fails:

1. Run `make check`
2. Read the error message carefully
3. Check this CHECKLIST.md
4. Check DEPLOYMENT.md for architecture details

**Remember: Always use `make deploy`. No exceptions.**
