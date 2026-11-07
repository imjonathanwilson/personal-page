# S3 bucket for static maintenance page fallback
# Serves content when EC2 instance is offline

resource "aws_s3_bucket" "maintenance" {
  #checkov:skip=CKV_AWS_144:Maintenance fallback page is rebuilt from the repo; cross-region replication is unnecessary cost
  #checkov:skip=CKV_AWS_145:Bucket holds only a public static HTML page; SSE-S3 default encryption is enough and a CMK adds cost
  #checkov:skip=CKV_AWS_18:Access logging would need a separate log bucket; content is a public static page
  #checkov:skip=CKV2_AWS_62:No event-driven consumers of this bucket
  #checkov:skip=CKV2_AWS_6:Public access block is intentionally disabled: CloudFront reads the S3 website endpoint as a custom origin, which requires public reads
  bucket = "${var.project_name}-maintenance"

  tags = {
    Name = "${var.project_name}-maintenance"
  }
}

resource "aws_s3_bucket_versioning" "maintenance" {
  bucket = aws_s3_bucket.maintenance.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "maintenance" {
  bucket = aws_s3_bucket.maintenance.id

  rule {
    id     = "cleanup"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }

  depends_on = [aws_s3_bucket_versioning.maintenance]
}

resource "aws_s3_bucket_public_access_block" "maintenance" {
  #checkov:skip=CKV_AWS_53:Intentionally public: S3 website endpoint used as CloudFront failover origin
  #checkov:skip=CKV_AWS_54:Intentionally public: S3 website endpoint used as CloudFront failover origin
  #checkov:skip=CKV_AWS_55:Intentionally public: S3 website endpoint used as CloudFront failover origin
  #checkov:skip=CKV_AWS_56:Intentionally public: S3 website endpoint used as CloudFront failover origin
  bucket = aws_s3_bucket.maintenance.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "maintenance" {
  bucket = aws_s3_bucket.maintenance.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_policy" "maintenance" {
  #checkov:skip=CKV_AWS_70:Public GetObject on the maintenance page is intentional; the bucket only holds a public static page
  bucket = aws_s3_bucket.maintenance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.maintenance.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.maintenance]
}

# Upload the maintenance page
resource "aws_s3_object" "maintenance_page" {
  bucket       = aws_s3_bucket.maintenance.id
  key          = "index.html"
  source       = "${path.module}/../website/maintenance.html"
  content_type = "text/html"
  etag         = filemd5("${path.module}/../website/maintenance.html")

  tags = {
    Name = "maintenance-page"
  }
}
