# Route53 Hosted Zone for nahyunjong.com
resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    Name = "${var.project_name}-zone"
  }
}

# Route53 Hosted Zone for nahyunjong.co.kr
resource "aws_route53_zone" "kr" {
  name = var.domain_name_kr

  tags = {
    Name = "${var.project_name}-zone-kr"
  }
}

# A Record for nahyunjong.com pointing to EC2 Elastic IP
resource "aws_route53_record" "main_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [aws_eip.app.public_ip]
}

# A Record for www.nahyunjong.com
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [aws_eip.app.public_ip]
}

# A Record for nahyunjong.co.kr
resource "aws_route53_record" "kr_a" {
  zone_id = aws_route53_zone.kr.zone_id
  name    = var.domain_name_kr
  type    = "A"
  ttl     = 300
  records = [aws_eip.app.public_ip]
}

# A Record for www.nahyunjong.co.kr
resource "aws_route53_record" "kr_www" {
  zone_id = aws_route53_zone.kr.zone_id
  name    = "www.${var.domain_name_kr}"
  type    = "A"
  ttl     = 300
  records = [aws_eip.app.public_ip]
}
