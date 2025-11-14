# ECR Repository for Client
resource "aws_ecr_repository" "client" {
  name                 = "${var.project_name}-client"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name    = "${var.project_name}-client-ecr"
    Project = var.project_name
  }
}

# ECR Repository for Server
resource "aws_ecr_repository" "server" {
  name                 = "${var.project_name}-server"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name    = "${var.project_name}-server-ecr"
    Project = var.project_name
  }
}

# ECR Lifecycle Policy for Client (keep last 5 images)
resource "aws_ecr_lifecycle_policy" "client" {
  repository = aws_ecr_repository.client.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 5
      }
      action = {
        type = "expire"
      }
    }]
  })
}

# ECR Lifecycle Policy for Server (keep last 5 images)
resource "aws_ecr_lifecycle_policy" "server" {
  repository = aws_ecr_repository.server.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 5
      }
      action = {
        type = "expire"
      }
    }]
  })
}

# Output ECR URLs
output "ecr_client_url" {
  value       = aws_ecr_repository.client.repository_url
  description = "ECR repository URL for client"
}

output "ecr_server_url" {
  value       = aws_ecr_repository.server.repository_url
  description = "ECR repository URL for server"
}
