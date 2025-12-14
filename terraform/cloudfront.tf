# CloudFront distribution for the website
# Provides global CDN, free SSL, and DDoS protection

resource "aws_cloudfront_distribution" "website" {
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
