# =============================================================================
# DNS (Route53)
# =============================================================================

locals {
  derived_root_domain   = trimprefix(var.domain_name, "www.")
  effective_root_domain = length(trimspace(var.root_domain)) > 0 ? var.root_domain : local.derived_root_domain
  listener_hostnames = distinct(concat(
    [var.domain_name],
    var.include_apex_host_header ? [local.effective_root_domain] : []
  ))
}

data "aws_route53_zone" "public" {
  count = var.manage_dns_records && var.route53_zone_id == "" ? 1 : 0

  name         = local.effective_root_domain
  private_zone = false
}

locals {
  effective_route53_zone_id = var.manage_dns_records ? (var.route53_zone_id != "" ? var.route53_zone_id : data.aws_route53_zone.public[0].zone_id) : null
}

resource "aws_route53_record" "apex_a" {
  count = var.manage_dns_records ? 1 : 0

  zone_id = local.effective_route53_zone_id
  name    = local.effective_root_domain
  type    = "A"

  alias {
    name                   = local.alb_dns_name
    zone_id                = local.alb_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "www_a" {
  count = var.manage_dns_records ? 1 : 0

  zone_id = local.effective_route53_zone_id
  name    = "www.${local.effective_root_domain}"
  type    = "A"

  alias {
    name                   = local.alb_dns_name
    zone_id                = local.alb_zone_id
    evaluate_target_health = true
  }
}
