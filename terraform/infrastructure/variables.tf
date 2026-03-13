# =============================================================================
# General Variables
# =============================================================================

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "rd-app"
}

variable "environment" {
  description = "Environment name (e.g., qa, production)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "wri_project" {
  description = "WRI project name for tagging"
  type        = string
  default     = "restoration-diagnostic"
}

variable "wri_owner" {
  description = "WRI owner email for tagging"
  type        = string
  default     = "kinshuk.govil@wri.org"
}

# =============================================================================
# VPC Variables
# =============================================================================

variable "vpc_id" {
  description = "ID of an existing VPC to use. Leave empty to create a new VPC. Ignored if shared_vpc_state_key is set."
  type        = string
  default     = ""
}

variable "shared_vpc_state_key" {
  description = "S3 state key of the environment that owns the shared VPC and ALB (e.g., 'qa/terraform.tfstate'). When set, the VPC ID, ALB, and listeners are read from that remote state."
  type        = string
  default     = ""
}

variable "vpc_cidr" {
  description = "CIDR block for VPC (only used when creating a new VPC)"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones_count" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2
}

# =============================================================================
# ECS Variables
# =============================================================================

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

variable "container_cpu" {
  description = "CPU units for the container (1 vCPU = 1024)"
  type        = number
  default     = 256
}

variable "container_memory" {
  description = "Memory for the container in MB"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 2
}

variable "min_capacity" {
  description = "Minimum number of tasks for auto-scaling"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of tasks for auto-scaling"
  type        = number
  default     = 4
}

variable "health_check_path" {
  description = "Health check path for the ALB target group"
  type        = string
  default     = "/api/health"
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name for the application (e.g., qa.restorationdiagnostic.org). Required for host-based ALB routing."
  type        = string
}

variable "listener_rule_priority" {
  description = "Priority for the ALB listener rule. Must be unique across all rules on the shared HTTPS listener. Lower values are evaluated first."
  type        = number
}

# =============================================================================
# RDS Variables
# =============================================================================

variable "rds_security_group_id" {
  description = "Security group ID of the RDS instance (created via AWS Console). ECS tasks will be granted ingress on port 5432."
  type        = string
}

# =============================================================================
# Application Variables
# =============================================================================

variable "app_environment_variables" {
  description = "Non-sensitive environment variables for the application"
  type        = map(string)
  default     = {}
}

variable "secret_environment_variables" {
  description = "Sensitive environment variables for the application (passed via CI/CD secrets, not stored in tfvars)"
  type        = map(string)
  default     = {}
  sensitive   = true
}
