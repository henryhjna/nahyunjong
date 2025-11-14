output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "ec2_public_ip" {
  description = "EC2 Elastic IP"
  value       = aws_eip.app.public_ip
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "route53_nameservers_com" {
  description = "Route53 nameservers for nahyunjong.com"
  value       = aws_route53_zone.main.name_servers
}

output "route53_nameservers_kr" {
  description = "Route53 nameservers for nahyunjong.co.kr"
  value       = aws_route53_zone.kr.name_servers
}

output "s3_backup_bucket" {
  description = "S3 backup bucket name"
  value       = aws_s3_bucket.backups.id
}

output "deployment_instructions" {
  description = "Next steps for deployment"
  value       = <<-EOT

    ========================================
    Deployment Instructions
    ========================================

    1. SSH into EC2 instance:
       ssh -i ~/.ssh/your-key.pem ubuntu@${aws_eip.app.public_ip}

    2. Clone repository:
       cd /home/ubuntu/nahyunjong
       git clone https://github.com/henryhjna/nahyunjong.git .

    3. Create .env.production file with these values:
       DB_HOST=${split(":", aws_db_instance.main.endpoint)[0]}
       DB_PORT=5432
       DB_NAME=${aws_db_instance.main.db_name}
       DB_USER=${var.db_username}
       DB_PASSWORD=<your-db-password>

       NEXT_PUBLIC_API_URL=https://${var.domain_name}/api
       ANTHROPIC_API_KEY=<your-anthropic-key>
       JWT_SECRET=<your-jwt-secret>

    4. Start services:
       docker compose -f docker-compose.prod.yml up -d

    5. Setup SSL certificates:
       docker compose -f docker-compose.prod.yml exec certbot certbot certonly --webroot --webroot-path=/var/www/certbot -d ${var.domain_name} -d www.${var.domain_name} --email ${var.admin_email} --agree-tos --non-interactive

    6. Update nameservers at your domain registrar:
       nahyunjong.com -> ${join(", ", aws_route53_zone.main.name_servers)}
       nahyunjong.co.kr -> ${join(", ", aws_route53_zone.kr.name_servers)}

    ========================================

  EOT
}
