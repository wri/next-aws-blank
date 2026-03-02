# =============================================================================
# Production Environment Configuration
# =============================================================================

project_name = "rd-app"
environment  = "production"
aws_region   = "us-east-1"

# VPC Configuration - shares the QA VPC via remote state
# The VPC ID is read automatically from QA's Terraform state
shared_vpc_state_key     = "qa/terraform.tfstate"
availability_zones_count = 2

# ECS Configuration - Higher resources for production
container_port   = 3000
container_cpu    = 512   # 0.5 vCPU
container_memory = 1024  # 1 GB
desired_count    = 2     # Higher for production
min_capacity     = 2
max_capacity     = 10

# Health Check
health_check_path = "/api/health"

# Application Environment Variables
app_environment_variables = {
  "LOG_LEVEL" = "info"
  "SESSION_SECRET" = "REDACTED_SESSION_SECRET-pending-production-pwd"
  "DATABASE_SSL_REJECT_UNAUTHORIZED" = "false"
}

certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/CERTIFICATE_ID_PLACEHOLDER"
domain_name     = "www.restorationdiagnostic.org"