# Private scratch bucket for Ansible's aws_ssm connection plugin file transfer.
# The controller (CI role) uploads/downloads through presigned URLs, so the
# instance role needs no S3 permissions. Objects are transient.

resource "aws_s3_bucket" "ssm_transfer" {
  #checkov:skip=CKV_AWS_144:Transient 1-day scratch bucket; cross-region replication is unnecessary cost
  #checkov:skip=CKV_AWS_145:Transient 1-day scratch bucket; SSE-S3 is sufficient and a CMK adds cost
  #checkov:skip=CKV_AWS_18:Access logging would need a separate log bucket; objects expire after 1 day
  #checkov:skip=CKV2_AWS_62:No event-driven consumers of this bucket
  #checkov:skip=CKV_AWS_21:Versioning not needed; objects are transient and expire after 1 day
  bucket = "${var.project_name}-ssm-transfer"

  tags = {
    Name = "${var.project_name}-ssm-transfer"
  }
}

resource "aws_s3_bucket_ownership_controls" "ssm_transfer" {
  bucket = aws_s3_bucket.ssm_transfer.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "ssm_transfer" {
  bucket = aws_s3_bucket.ssm_transfer.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ssm_transfer" {
  bucket = aws_s3_bucket.ssm_transfer.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "ssm_transfer" {
  bucket = aws_s3_bucket.ssm_transfer.id

  rule {
    id     = "expire-transient-objects"
    status = "Enabled"

    filter {}

    expiration {
      days = 1
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

resource "aws_s3_bucket_policy" "ssm_transfer" {
  bucket = aws_s3_bucket.ssm_transfer.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyInsecureTransport"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.ssm_transfer.arn,
          "${aws_s3_bucket.ssm_transfer.arn}/*",
        ]
        Condition = {
          Bool = { "aws:SecureTransport" = "false" }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.ssm_transfer]
}
