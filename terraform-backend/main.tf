# This file creates the S3 bucket for Terraform state
# Run this FIRST before enabling the backend in main.tf

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.71"
    }
  }
}

provider "aws" {
  region  = "us-east-1"
  profile = "terraform-deployer"
}

# S3 Bucket for Terraform State
resource "aws_s3_bucket" "terraform_state" {
  #checkov:skip=CKV2_AWS_61:Lifecycle expiry would delete old state versions kept for recovery
  #checkov:skip=CKV2_AWS_62:No consumer for state-change events
  #checkov:skip=CKV_AWS_144:Single-region personal project; versioning covers recovery
  #checkov:skip=CKV_AWS_145:SSE-S3 encryption is enabled; a KMS CMK adds cost without benefit here
  #checkov:skip=CKV_AWS_18:Access logging needs a separate log bucket; CloudTrail covers API access
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
#
# Two roles:
#   github-actions-personal-page       write role, trusted for refs/heads/main only
#   github-actions-personal-page-plan  read-only role, trusted for pull_request only
#
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
  boundary_arn      = "arn:aws:iam::${local.account_id}:policy/${local.project_name}-boundary"
  project_role_arn  = "arn:aws:iam::${local.account_id}:role/${local.project_name}-*"
}

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]

  tags = {
    Name      = "GitHub Actions OIDC"
    ManagedBy = "Terraform"
  }
}

# -----------------------------------------------------------------------------
# Permissions boundary for every role created by terraform/ (project roles).
# Lives here, not in terraform/, so the CI write role cannot alter it.
# Allows only what the project roles need:
#   - EC2 instance role: the actions in AmazonSSMManagedInstanceCore
#   - EventBridge scheduler role: ec2:StartInstances / ec2:StopInstances
# -----------------------------------------------------------------------------
resource "aws_iam_policy" "project_boundary" {
  #checkov:skip=CKV_AWS_290:Permissions boundary is a ceiling, not a grant; role policies scope resources
  #checkov:skip=CKV_AWS_355:Permissions boundary is a ceiling, not a grant; SSM agent actions require Resource "*"
  name        = "${local.project_name}-boundary"
  description = "Permissions boundary for jonathan-wilson project roles"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SsmManagedInstanceCore"
        Effect = "Allow"
        Action = [
          "ssm:DescribeAssociation",
          "ssm:GetDeployablePatchSnapshotForInstance",
          "ssm:GetDocument",
          "ssm:DescribeDocument",
          "ssm:GetManifest",
          "ssm:ListAssociations",
          "ssm:ListInstanceAssociations",
          "ssm:PutInventory",
          "ssm:PutComplianceItems",
          "ssm:PutConfigurePackageResult",
          "ssm:UpdateAssociationStatus",
          "ssm:UpdateInstanceAssociationStatus",
          "ssm:UpdateInstanceInformation",
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel",
          "ec2messages:AcknowledgeMessage",
          "ec2messages:DeleteMessage",
          "ec2messages:FailMessage",
          "ec2messages:GetEndpoint",
          "ec2messages:GetMessages",
          "ec2messages:SendReply",
        ]
        Resource = "*"
      },
      {
        Sid      = "SchedulerStartStopEc2"
        Effect   = "Allow"
        Action   = ["ec2:StartInstances", "ec2:StopInstances"]
        Resource = "*"
      },
    ]
  })
}

# -----------------------------------------------------------------------------
# Write role: terraform apply, Ansible over SSM, CloudFront invalidation.
# main branch only.
# -----------------------------------------------------------------------------
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
            "token.actions.githubusercontent.com:sub" = "repo:${local.github_repository}:ref:refs/heads/main"
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
        # Private scratch bucket for Ansible aws_ssm file transfer (presigned
        # URLs are signed by this role, so the instance role needs no S3).
        Sid    = "SsmTransferBucket"
        Effect = "Allow"
        Action = "s3:*"
        Resource = [
          "arn:aws:s3:::${local.project_name}-ssm-transfer",
          "arn:aws:s3:::${local.project_name}-ssm-transfer/*",
        ]
      },
      {
        Sid      = "CloudFrontResponseHeadersPolicies"
        Effect   = "Allow"
        Action   = "cloudfront:*ResponseHeadersPolic*"
        Resource = "arn:aws:cloudfront::${local.account_id}:response-headers-policy/*"
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
        # Read and tag actions, plus UpdateAssumeRolePolicy. UpdateAssumeRolePolicy
        # is kept because terraform must be able to update a project role's
        # assume_role_policy in place; it is limited to project roles, which
        # are bounded by the permissions boundary.
        Sid    = "ManageProjectIamRoles"
        Effect = "Allow"
        Action = [
          "iam:DeleteRole",
          "iam:GetRole",
          "iam:UpdateRole",
          "iam:UpdateAssumeRolePolicy",
          "iam:TagRole",
          "iam:UntagRole",
          "iam:ListRoleTags",
          "iam:GetRolePolicy",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
          "iam:ListInstanceProfilesForRole",
        ]
        Resource = local.project_role_arn
      },
      {
        # Terraform passes project roles to EC2 (instance profile) and to
        # EventBridge Scheduler (schedule targets) only.
        Sid      = "PassProjectRolesToEc2AndScheduler"
        Effect   = "Allow"
        Action   = "iam:PassRole"
        Resource = local.project_role_arn
        Condition = {
          StringEquals = {
            "iam:PassedToService" = ["ec2.amazonaws.com", "scheduler.amazonaws.com"]
          }
        }
      },
      {
        # Role creation and inline-policy changes require the boundary.
        Sid    = "WriteProjectRolesRequireBoundary"
        Effect = "Allow"
        Action = [
          "iam:CreateRole",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:PutRolePermissionsBoundary",
        ]
        Resource = local.project_role_arn
        Condition = {
          StringEquals = { "iam:PermissionsBoundary" = local.boundary_arn }
        }
      },
      {
        Sid      = "AttachOnlySsmManagedPolicy"
        Effect   = "Allow"
        Action   = ["iam:AttachRolePolicy", "iam:DetachRolePolicy"]
        Resource = local.project_role_arn
        Condition = {
          ArnEquals = {
            "iam:PolicyARN" = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
          }
          StringEquals = { "iam:PermissionsBoundary" = local.boundary_arn }
        }
      },
      {
        Sid      = "DenyRemovingBoundary"
        Effect   = "Deny"
        Action   = "iam:DeleteRolePermissionsBoundary"
        Resource = "*"
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
        # Used by the Ansible aws_ssm connection plugin (session start; file
        # transfer goes through the ssm-transfer bucket granted above).
        # Only project-tagged instances (Project tag comes from default_tags in terraform/).
        Sid      = "SsmSessionToProjectInstances"
        Effect   = "Allow"
        Action   = "ssm:StartSession"
        Resource = "arn:aws:ec2:${local.region}:${local.account_id}:instance/*"
        Condition = {
          StringEquals = { "aws:ResourceTag/Project" = "JonathanWilson90s" }
        }
      },
      {
        # Session document: account-owned preferences doc ARN, plus the
        # region-only form for safety.
        Sid    = "SsmSessionDocument"
        Effect = "Allow"
        Action = "ssm:StartSession"
        Resource = [
          "arn:aws:ssm:${local.region}:${local.account_id}:document/SSM-SessionManagerRunShell",
          "arn:aws:ssm:${local.region}::document/SSM-SessionManagerRunShell",
        ]
      },
      {
        Sid    = "SsmSessionLifecycle"
        Effect = "Allow"
        Action = [
          "ssm:TerminateSession",
          "ssm:ResumeSession",
          "ssm:DescribeInstanceInformation",
          "ssm:DescribeSessions",
          "ssm:GetConnectionStatus",
        ]
        Resource = "*"
      },
    ]
  })
}

# -----------------------------------------------------------------------------
# Plan role: read-only, for pull_request runs of terraform plan.
# -----------------------------------------------------------------------------
resource "aws_iam_role" "github_actions_plan" {
  name = "github-actions-personal-page-plan"

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
            "token.actions.githubusercontent.com:sub" = "repo:${local.github_repository}:pull_request"
          }
        }
      }
    ]
  })

  tags = {
    Name      = "github-actions-personal-page-plan"
    ManagedBy = "Terraform"
  }
}

resource "aws_iam_role_policy_attachment" "github_actions_plan_readonly" {
  role       = aws_iam_role.github_actions_plan.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

resource "aws_iam_role_policy" "github_actions_plan" {
  name = "github-actions-personal-page-plan-state"
  role = aws_iam_role.github_actions_plan.id

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
        Sid      = "StateRead"
        Effect   = "Allow"
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.terraform_state.arn}/website/*"
      },
      {
        # terraform plan with use_lockfile writes and removes the lock object
        Sid      = "StateLockfileOnly"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.terraform_state.arn}/website/terraform.tfstate.tflock"
      },
    ]
  })
}

output "github_actions_role_arn" {
  description = "Set this as the AWS_ROLE_ARN GitHub Actions secret"
  value       = aws_iam_role.github_actions.arn
}

output "github_actions_plan_role_arn" {
  description = "Set this as the AWS_PLAN_ROLE_ARN GitHub Actions secret"
  value       = aws_iam_role.github_actions_plan.arn
}

output "project_boundary_policy_arn" {
  description = "Permissions boundary required on all jonathan-wilson-* roles"
  value       = aws_iam_policy.project_boundary.arn
}
