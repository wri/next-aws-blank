# =============================================================================
# ALB Locals
# =============================================================================

locals {
  # When sharing infrastructure via remote state, reuse the existing ALB
  create_alb         = var.shared_vpc_state_key == ""
  alb_arn            = local.create_alb ? aws_lb.main[0].arn : data.terraform_remote_state.shared_vpc[0].outputs.alb_arn
  alb_dns_name       = local.create_alb ? aws_lb.main[0].dns_name : data.terraform_remote_state.shared_vpc[0].outputs.alb_dns_name
  alb_zone_id        = local.create_alb ? aws_lb.main[0].zone_id : data.terraform_remote_state.shared_vpc[0].outputs.alb_zone_id
  https_listener_arn = local.create_alb ? aws_lb_listener.https[0].arn : data.terraform_remote_state.shared_vpc[0].outputs.https_listener_arn
  http_listener_arn  = local.create_alb ? aws_lb_listener.http[0].arn : data.terraform_remote_state.shared_vpc[0].outputs.http_listener_arn
  alb_sg_id          = local.create_alb ? aws_security_group.alb[0].id : data.terraform_remote_state.shared_vpc[0].outputs.alb_security_group_id
}

# =============================================================================
# Application Load Balancer
# =============================================================================

resource "aws_lb" "main" {
  count = local.create_alb ? 1 : 0

  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb[0].id]
  subnets            = local.public_subnet_ids

  enable_deletion_protection = false

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# =============================================================================
# Target Group
# =============================================================================

resource "aws_lb_target_group" "app" {
  name        = "${var.project_name}-${var.environment}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = local.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 5
    timeout             = 10
    interval            = 30
    path                = var.health_check_path
    protocol            = "HTTP"
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-tg"
  }
}

# =============================================================================
# ALB Listeners (only created by the environment that owns the ALB)
# =============================================================================

# HTTPS listener - default action returns 404 for unmatched hosts
resource "aws_lb_listener" "https" {
  count = local.create_alb ? 1 : 0

  load_balancer_arn = aws_lb.main[0].arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-Res-PQ-2025-09"
  certificate_arn   = var.certificate_arn

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

# HTTP listener - redirect to HTTPS
resource "aws_lb_listener" "http" {
  count = local.create_alb ? 1 : 0

  load_balancer_arn = aws_lb.main[0].arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# =============================================================================
# Host-based Listener Rules (created by every environment)
# =============================================================================

resource "aws_lb_listener_rule" "https_host" {
  listener_arn = local.https_listener_arn
  priority     = var.listener_rule_priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  condition {
    host_header {
      values = [var.domain_name]
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-https-rule"
    Environment = var.environment
  }
}
