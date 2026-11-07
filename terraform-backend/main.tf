# This file creates the S3 bucket for Terraform state
# Run this FIRST before enabling the backend in main.tf

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = "us-east-1"
  profile = "terraform-deployer"
}

# S3 Bucket for Terraform State
resource "aws_s3_bucket" "terraform_state" {
  bucket = "jonathan-wilson-terraform-state"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name      = "Terraform State Bucket"
    Purpose   = "TerraformState"
    Project   = "JonathanWilson90s"
    ManagedBy = "Terraform"
  }
}

# Enable versioning for state file history
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.id
}

# -----------------------------------------------------------------------------
# GitHub Actions OIDC federation (replaces long-lived AWS access keys)
# NOTE: only one OIDC provider per URL can exist per AWS account. If one for
# token.actions.githubusercontent.com already exists, import it instead of
# creating it:
#   terraform import aws_iam_openid_connect_provider.github <provider-arn>
# -----------------------------------------------------------------------------

data "aws_caller_identity" "current" {}

locals {
  github_repository = "imjonathanwilson/personal-page"
  project_name      = "jonathan-wilson"
  account_id        = data.aws_caller_identity.current.account_id
  region            = "us-east-1"
}

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]

  tags = {
    Name      = "GitHub Actions OIDC"
    ManagedBy = "Terraform"
  }
}

resource "aws_iam_role" "github_actions" {
  name = "github-actions-personal-page"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRoleWithWebIdentity"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = [
              "repo:${local.github_repository}:ref:refs/heads/main",
              "repo:${local.github_repository}:pull_request",
            ]
          }
        }
      }
    ]
  })

  tags = {
    Name      = "github-actions-personal-page"
    ManagedBy = "Terraform"
  }
}

# Permissions needed by the pipeline: terraform plan/apply for terraform/,
# Ansible over SSM, and CloudFront invalidation.
resource "aws_iam_role_policy" "github_actions" {
  name = "github-actions-personal-page-deploy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "StateBucketList"
        Effect   = "Allow"
        Action   = ["s3:ListBucket", "s3:GetBucketVersioning"]
        Resource = aws_s3_bucket.terraform_state.arn
      },
      {
        # Includes the use_lockfile object (website/terraform.tfstate.tflock)
        Sid      = "StateObjectAccess"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.terraform_state.arn}/website/*"
      },
      {
        # Most EC2/VPC create and describe actions do not support
        # resource-level permissions, so scope by region only.
        Sid      = "Ec2AndVpc"
        Effect   = "Allow"
        Action   = "ec2:*"
        Resource = "*"
        Condition = {
          StringEquals = { "aws:RequestedRegion" = local.region }
        }
      },
      {
        Sid    = "MaintenanceBucket"
        Effect = "Allow"
        Action = "s3:*"
        Resource = [
          "arn:aws:s3:::${local.project_name}-maintenance",
          "arn:aws:s3:::${local.project_name}-maintenance/*",
        ]
      },
      {
        Sid      = "CloudFrontDistributions"
        Effect   = "Allow"
        Action   = "cloudfront:*"
        Resource = "arn:aws:cloudfront::${local.account_id}:distribution/*"
      },
      {
        Sid    = "CloudFrontGlobalReadAndCreate"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateDistribution",
          "cloudfront:CreateDistributionWithTags",
          "cloudfront:ListDistributions",
          "cloudfront:GetCachePolicy",
          "cloudfront:ListCachePolicies",
          "cloudfront:GetOriginRequestPolicy",
          "cloudfront:ListOriginRequestPolicies",
          "cloudfront:GetResponseHeadersPolicy",
          "cloudfront:ListResponseHeadersPolicies",
        ]
        Resource = "*"
      },
      {
        # Roles / instance profiles created by terraform/iam.tf. The CI role's
        # own name does not match the prefix, so it cannot modify itself.
        Sid    = "ManageProjectIamRoles"
        Effect = "Allow"
        Action = [
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:GetRole",
          "iam:UpdateRole",
          "iam:UpdateAssumeRolePolicy",
          "iam:TagRole",
          "iam:UntagRole",
          "iam:ListRoleTags",
          "iam:PutRolePolicy",
          "iam:GetRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
          "iam:ListInstanceProfilesForRole",
          "iam:PassRole",
        ]
        Resource = "arn:aws:iam::${local.account_id}:role/${local.project_name}-*"
      },
      {
        Sid      = "AttachOnlySsmManagedPolicy"
        Effect   = "Allow"
        Action   = ["iam:AttachRolePolicy", "iam:DetachRolePolicy"]
        Resource = "arn:aws:iam::${local.account_id}:role/${local.project_name}-*"
        Condition = {
          ArnEquals = {
            "iam:PolicyARN" = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
          }
        }
      },
      {
        Sid    = "ManageProjectInstanceProfiles"
        Effect = "Allow"
        Action = [
          "iam:CreateInstanceProfile",
          "iam:DeleteInstanceProfile",
          "iam:GetInstanceProfile",
          "iam:AddRoleToInstanceProfile",
          "iam:RemoveRoleFromInstanceProfile",
          "iam:TagInstanceProfile",
          "iam:UntagInstanceProfile",
          "iam:ListInstanceProfileTags",
        ]
        Resource = "arn:aws:iam::${local.account_id}:instance-profile/${local.project_name}-*"
      },
      {
        Sid      = "ReadAwsManagedPolicies"
        Effect   = "Allow"
        Action   = ["iam:GetPolicy", "iam:GetPolicyVersion"]
        Resource = "arn:aws:iam::aws:policy/*"
      },
      {
        Sid      = "EventBridgeScheduler"
        Effect   = "Allow"
        Action   = "scheduler:*"
        Resource = "arn:aws:scheduler:${local.region}:${local.account_id}:schedule/default/${local.project_name}-*"
      },
      {
        # Used by the Ansible aws_ssm connection plugin
        Sid    = "SsmSessionToInstances"
        Effect = "Allow"
        Action = ["ssm:StartSession", "ssm:SendCommand"]
        Resource = [
          "arn:aws:ec2:${local.region}:${local.account_id}:instance/*",
          "arn:aws:ssm:${local.region}::document/SSM-SessionManagerRunShell",
          "arn:aws:ssm:${local.region}::document/AWS-RunShellScript",
        ]
      },
      {
        Sid    = "SsmSessionLifecycle"
        Effect = "Allow"
        Action = [
          "ssm:TerminateSession",
          "ssm:ResumeSession",
          "ssm:GetCommandInvocation",
          "ssm:ListCommandInvocations",
          "ssm:DescribeInstanceInformation",
          "ssm:DescribeSessions",
          "ssm:GetConnectionStatus",
        ]
        Resource = "*"
      },
    ]
  })
}

output "github_actions_role_arn" {
  description = "Set this as the AWS_ROLE_ARN GitHub Actions secret"
  value       = aws_iam_role.github_actions.arn
}
