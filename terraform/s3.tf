# S3 bucket for static maintenance page fallback
# Serves content when EC2 instance is offline

resource "aws_s3_bucket" "maintenance" {
  bucket = "${var.project_name}-maintenance"

  tags = {
    Name = "${var.project_name}-maintenance"
  }
}

resource "aws_s3_bucket_public_access_block" "maintenance" {
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
