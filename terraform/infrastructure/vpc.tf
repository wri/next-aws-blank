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
  shared_vpc_id     = var.shared_vpc_state_key != "" ? data.terraform_remote_state.shared_vpc[0].outputs.vpc_id : null
  effective_vpc_id  = local.shared_vpc_id != null ? local.shared_vpc_id : (var.vpc_id != "" ? var.vpc_id : null)
  create_vpc        = local.effective_vpc_id == null
  vpc_id            = local.create_vpc ? aws_vpc.main[0].id : local.effective_vpc_id
  public_subnet_ids = local.create_vpc ? aws_subnet.public[*].id : data.aws_subnets.public[0].ids
}

# =============================================================================
# Data sources for existing VPC subnets (when using a shared VPC)
# =============================================================================

data "aws_subnets" "public" {
  count = local.create_vpc ? 0 : 1

  filter {
    name   = "vpc-id"
    values = [local.effective_vpc_id]
  }

  tags = {
    Type = "public"
  }
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
