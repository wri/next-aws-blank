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
desired_count    = 1     # Higher for production
min_capacity     = 1
max_capacity     = 2

# Health Check
health_check_path = "/api/health"

# Application Environment Variables
app_environment_variables = {
  "LOG_LEVEL"                        = "info"
  "DB_HOST"                          = "xxx.rds.amazonaws.com"
  "DB_PORT"                          = "5432"
  "DB_NAME"                          = "production"
}

# Sensitive variables (DB_USER, DB_PASSWORD, SESSION_SECRET)
# are passed via the RD_APP_ENV GitHub secret as
# secret_environment_variables.

certificate_arn        = "arn:aws:acm:us-east-1:123456789012:certificate/CERTIFICATE_ID_PLACEHOLDER"
domain_name            = "www.restorationdiagnostic.org"
listener_rule_priority = 200