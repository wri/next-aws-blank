# =============================================================================
# Remote state for shared VPC (when using another environment's VPC)
# =============================================================================

data "terraform_remote_state" "shared_vpc" {
  count   = var.shared_vpc_state_key != "" ? 1 : 0
  backend = "s3"

  config = {
    bucket = "next-aws-blank-app-terraform-state-shared"
    key    = var.shared_vpc_state_key
    region = var.aws_region
  }
}

# =============================================================================
# VPC Locals
# =============================================================================

locals {
  # Resolve VPC ID: remote state > explicit var > create new
  shared_vpc_id                        = var.shared_vpc_state_key != "" ? data.terraform_remote_state.shared_vpc[0].outputs.vpc_id : null
  effective_vpc_id                     = local.shared_vpc_id != null ? local.shared_vpc_id : (var.vpc_id != "" ? var.vpc_id : null)
  create_vpc                           = local.effective_vpc_id == null
  vpc_id                               = local.create_vpc ? aws_vpc.main[0].id : local.effective_vpc_id
  discover_existing_vpc_public_subnets = !local.create_vpc && var.shared_vpc_state_key == "" && length(var.public_subnet_ids) == 0

  # Existing-VPC fallback: classify subnets as public when their effective route table
  # has a default route (0.0.0.0/0) to an Internet Gateway.
  discovered_public_subnet_ids = local.discover_existing_vpc_public_subnets ? sort([
    for subnet_id, rt in data.aws_route_table.by_subnet : subnet_id
    if anytrue([
      for route in rt.routes : try(
        route.cidr_block == "0.0.0.0/0" && route.gateway_id != null && startswith(route.gateway_id, "igw-"),
        false
      )
    ])
  ]) : []
  has_discovered_public_subnets = !local.discover_existing_vpc_public_subnets || length(local.discovered_public_subnet_ids) > 0

  # Resolve subnets: remote state > explicit input > IGW-route discovery fallback.
  public_subnet_ids = local.create_vpc ? aws_subnet.public[*].id : (
    var.shared_vpc_state_key != "" ? data.terraform_remote_state.shared_vpc[0].outputs.public_subnet_ids : (
      length(var.public_subnet_ids) > 0 ? var.public_subnet_ids : local.discovered_public_subnet_ids
    )
  )
}

# =============================================================================
# Data sources for existing VPC subnet discovery (existing VPC without shared remote state)
# =============================================================================

data "aws_subnets" "all" {
  count = local.discover_existing_vpc_public_subnets ? 1 : 0

  filter {
    name   = "vpc-id"
    values = [local.effective_vpc_id]
  }
}

data "aws_route_table" "by_subnet" {
  for_each = local.discover_existing_vpc_public_subnets ? toset(data.aws_subnets.all[0].ids) : toset([])

  subnet_id = each.value
}



# =============================================================================
# VPC
# =============================================================================

resource "aws_vpc" "main" {
  count = local.create_vpc ? 1 : 0

  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

# =============================================================================
# Internet Gateway
# =============================================================================

resource "aws_internet_gateway" "main" {
  count = local.create_vpc ? 1 : 0

  vpc_id = aws_vpc.main[0].id

  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

# =============================================================================
# Public Subnets
# =============================================================================

resource "aws_subnet" "public" {
  count = local.create_vpc ? var.availability_zones_count : 0

  vpc_id                  = aws_vpc.main[0].id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-${var.environment}-public-${count.index + 1}"
    Type = "public"
  }
}



# =============================================================================
# Route Tables
# =============================================================================

# Public route table
resource "aws_route_table" "public" {
  count = local.create_vpc ? 1 : 0

  vpc_id = aws_vpc.main[0].id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main[0].id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count = local.create_vpc ? var.availability_zones_count : 0

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public[0].id
}
