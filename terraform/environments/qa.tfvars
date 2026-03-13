# =============================================================================
# QA Environment Configuration
# =============================================================================

project_name = "rd-app"
environment  = "qa"
aws_region   = "us-east-1"

# VPC Configuration
vpc_cidr                 = "10.0.0.0/16"
availability_zones_count = 2

# ECS Configuration
container_port   = 3000
container_cpu    = 256   # 0.25 vCPU
container_memory = 512   # 512 MB
desired_count    = 1     # Lower for QA
min_capacity     = 1
max_capacity     = 2

# Health Check
health_check_path = "/api/health"

# Application Environment Variables
# some of these should be secret and will be changed shortly
app_environment_variables = {
  "LOG_LEVEL"                        = "debug"
  "DB_HOST"                          = "xxx.rds.amazonaws.com"
  "DB_PORT"                          = "5432"
  "DB_NAME"                          = "qa"
}

# Sensitive variables (DB_USER, DB_PASSWORD, SESSION_SECRET)
# are passed via the RD_APP_ENV GitHub secret as
# secret_environment_variables.

# RDS Security Group (managed via AWS Console)
rds_security_group_id = "SG_ID_PLACEHOLDER"

certificate_arn        = "arn:aws:acm:us-east-1:123456789012:certificate/CERTIFICATE_ID_PLACEHOLDER"
domain_name            = "qa.restorationdiagnostic.org"
listener_rule_priority = 100