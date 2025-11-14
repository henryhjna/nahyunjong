# Bootstrap configuration to create S3 and DynamoDB for Terraform backend
# Run this FIRST before enabling the backend in main.tf

# This file creates the S3 bucket and DynamoDB table needed for Terraform state backend
# After running this, comment out this file and uncomment the backend block in main.tf
