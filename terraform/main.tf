terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend will be enabled after S3 bucket is created
  # backend "s3" {
  #   bucket         = "nahyunjong-terraform-state"
  #   key            = "terraform.tfstate"
  #   region         = "ap-northeast-2"
  #   encrypt        = true
  #   dynamodb_table = "nahyunjong-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "nahyunjong"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
