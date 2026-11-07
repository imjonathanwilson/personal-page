# CloudFront distribution for the website
# Provides global CDN, free SSL, and DDoS protection

# Baseline security headers (mirrors the AWS managed SecurityHeadersPolicy)
resource "aws_cloudfront_response_headers_policy" "security" {
  name = "${var.project_name}-security-headers"

  security_headers_config {
    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "SAMEORIGIN"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
  }
}

resource "aws_cloudfront_distribution" "website" {
  #checkov:skip=CKV_AWS_68:WAF costs a monthly fee plus per-request charges; this is a low-traffic static personal site
  #checkov:skip=CKV_AWS_86:Access logging needs an extra S3 log bucket; site is a low-traffic personal page and logging is not required
  #checkov:skip=CKV_AWS_374:Personal site is intentionally reachable worldwide; no geo restriction wanted
  #checkov:skip=CKV2_AWS_42:Custom certificate is applied when var.domain_name is set; default CloudFront cert is used otherwise
  #checkov:skip=CKV2_AWS_47:No WAF is attached (see CKV_AWS_68), so the Log4j AMR rule does not apply
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Jonathan Wilson 90s Website CDN"
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # North America and Europe only (cheapest)
  aliases             = var.domain_name != "" ? [var.domain_name] : []

  # Primary origin: EC2 instance (DNS name derived from Elastic IP)
  origin {
    domain_name = "ec2-${replace(aws_eip.web_server.public_ip, ".", "-")}.compute-1.amazonaws.com"
    origin_id   = "ec2-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Failover origin: S3 maintenance page
  origin {
    domain_name = aws_s3_bucket_website_configuration.maintenance.website_endpoint
    origin_id   = "s3-maintenance-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Origin group with automatic failover
  origin_group {
    origin_id = "origin-group-with-failover"

    failover_criteria {
      status_codes = [500, 502, 503, 504]
    }

    member {
      origin_id = "ec2-origin"
    }

    member {
      origin_id = "s3-maintenance-origin"
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "origin-group-with-failover"

    forwarded_values {
      query_string = false
      headers      = []

      cookies {
        forward = "none"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.domain_name == "" ? true : false
    acm_certificate_arn            = var.domain_name != "" ? var.acm_certificate_arn : null
    ssl_support_method             = var.domain_name != "" ? "sni-only" : null
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.project_name}-cdn"
  }
}

# CloudFront Origin Access Identity (if we want to restrict EC2 access to CloudFront only)
# Commented out for now to keep things simple, but can be enabled for security
# resource "aws_cloudfront_origin_access_identity" "website" {
#   comment = "Origin access identity for Jonathan Wilson website"
# }
