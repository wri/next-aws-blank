# =============================================================================
# Production Environment Configuration
# =============================================================================

# WARNING: This file intentionally contains sanitized placeholder values.
# Replace all *_PLACEHOLDER values with valid production identifiers before
# running terraform plan/apply or the deployment will fail or be misconfigured.

project_name = "next-aws-blank-app"
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
  "DB_HOST"                          = "DB_HOST_PLACEHOLDER"
  "DB_PORT"                          = "5432"
  "DB_NAME"                          = "production"
}

# Sensitive variables (DB_USER, DB_PASSWORD, SESSION_SECRET)
# are passed via the PLACEHOLDER_APP_ENV GitHub secret as
# placeholder_app_env (ECS valueFrom ARNs).

# RDS Security Group (managed via AWS Console)
rds_security_group_id = "SG_ID_PLACEHOLDER"

certificate_arn        = "ACM_CERT_ARN_PLACEHOLDER"
domain_name            = "www.example.org"
root_domain            = "example.org"
include_alb_dns_host_header = true
listener_rule_priority = 200