variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "jonathan-wilson"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Public subnet CIDR block"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance type (Graviton ARM64)"
  type        = string
  default     = "t4g.small"
}

variable "aws_profile" {
  description = "AWS CLI profile to use (optional - uses environment credentials if not set)"
  type        = string
  default     = null
}

variable "domain_name" {
  description = "Custom domain name (optional - leave empty to use CloudFront domain only)"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for custom domain (required if domain_name is set)"
  type        = string
  default     = ""
}
