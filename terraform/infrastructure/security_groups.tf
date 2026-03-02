# =============================================================================
# ALB Security Group (only created by the environment that owns the ALB)
# =============================================================================

resource "aws_security_group" "alb" {
  count = local.create_alb ? 1 : 0

  name        = "${var.project_name}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = local.vpc_id

  revoke_rules_on_delete = true

  tags = {
    Name = "${var.project_name}-alb-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# --- ALB Security Group Rules (separate resources to avoid dependency cycles) ---

resource "aws_security_group_rule" "alb_ingress_http" {
  count = local.create_alb ? 1 : 0

  security_group_id = aws_security_group.alb[0].id
  type              = "ingress"
  description       = "HTTP from anywhere"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "alb_ingress_https" {
  count = local.create_alb ? 1 : 0

  security_group_id = aws_security_group.alb[0].id
  type              = "ingress"
  description       = "HTTPS from anywhere"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "alb_egress_all" {
  count = local.create_alb ? 1 : 0

  security_group_id = aws_security_group.alb[0].id
  type              = "egress"
  description       = "All outbound traffic"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
}

# =============================================================================
# ECS Security Group
# =============================================================================

resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-${var.environment}-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = local.vpc_id

  revoke_rules_on_delete = true

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# --- ECS Security Group Rules (separate resources to avoid dependency cycles) ---

resource "aws_security_group_rule" "ecs_ingress_alb" {
  security_group_id        = aws_security_group.ecs.id
  type                     = "ingress"
  description              = "Allow traffic from ALB"
  from_port                = var.container_port
  to_port                  = var.container_port
  protocol                 = "tcp"
  source_security_group_id = local.alb_sg_id
}

resource "aws_security_group_rule" "ecs_egress_all" {
  security_group_id = aws_security_group.ecs.id
  type              = "egress"
  description       = "All outbound traffic"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
}
