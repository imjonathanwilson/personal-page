# Permissions boundary managed in terraform-backend/ (so the CI role cannot edit
# it). Every project role must carry it; the CI role is only allowed to create
# or modify roles with this boundary attached.
data "aws_caller_identity" "current" {}

locals {
  permissions_boundary_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/${var.project_name}-boundary"
}

# IAM Role for EC2 to use SSM
resource "aws_iam_role" "ec2_ssm_role" {
  name                 = "${var.project_name}-ec2-ssm-role"
  permissions_boundary = local.permissions_boundary_arn

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ec2-ssm-role"
  }
}

# Attach AWS managed policy for SSM
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile for EC2
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_ssm_role.name

  tags = {
    Name = "${var.project_name}-ec2-profile"
  }
}

# IAM Role for EventBridge Scheduler to start/stop EC2
resource "aws_iam_role" "eventbridge_scheduler_role" {
  name                 = "${var.project_name}-eventbridge-scheduler-role"
  permissions_boundary = local.permissions_boundary_arn

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "scheduler.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-eventbridge-scheduler-role"
  }
}

# IAM Policy for EventBridge to start/stop EC2 instances
resource "aws_iam_role_policy" "eventbridge_ec2_policy" {
  name = "${var.project_name}-eventbridge-ec2-policy"
  role = aws_iam_role.eventbridge_scheduler_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:StartInstances",
          "ec2:StopInstances"
        ]
        Resource = aws_instance.web_server.arn
      }
    ]
  })
}
