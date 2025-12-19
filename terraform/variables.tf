variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"  # Seoul
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "nahyunjong"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "nahyunjong.com"
}

variable "domain_name_kr" {
  description = "Korean domain name"
  type        = string
  default     = "nahyunjong.co.kr"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-northeast-2a", "ap-northeast-2c"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t4g.micro"  # ARM-based, cheaper than t3.micro
}

variable "ec2_key_name" {
  description = "EC2 key pair name"
  type        = string
}

variable "admin_email" {
  description = "Admin email for notifications"
  type        = string
  default     = "na.hyunjong@gmail.com"
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed to SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Change this to your IP in production
}
