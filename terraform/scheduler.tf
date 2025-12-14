# EventBridge Scheduler for automated EC2 start/stop
# Saves costs by running the server only during specified hours

# Stop EC2 instance at 11 PM Eastern Time (04:00 UTC)
resource "aws_scheduler_schedule" "stop_ec2" {
  name       = "${var.project_name}-stop-ec2"
  group_name = "default"

  flexible_time_window {
    mode = "OFF"
  }

  # Cron expression: 0 4 * * ? (04:00 UTC = 11:00 PM ET)
  # Runs every day at 11 PM Eastern Time
  schedule_expression          = "cron(0 4 * * ? *)"
  schedule_expression_timezone = "UTC"

  target {
    arn      = "arn:aws:scheduler:::aws-sdk:ec2:stopInstances"
    role_arn = aws_iam_role.eventbridge_scheduler_role.arn

    input = jsonencode({
      InstanceIds = [aws_instance.web_server.id]
    })
  }

  description = "Stop EC2 instance at 11 PM ET (04:00 UTC) daily"
}

# Start EC2 instance at 6 AM Eastern Time (11:00 UTC)
resource "aws_scheduler_schedule" "start_ec2" {
  name       = "${var.project_name}-start-ec2"
  group_name = "default"

  flexible_time_window {
    mode = "OFF"
  }

  # Cron expression: 0 11 * * ? (11:00 UTC = 6:00 AM ET)
  # Runs every day at 6 AM Eastern Time
  schedule_expression          = "cron(0 11 * * ? *)"
  schedule_expression_timezone = "UTC"

  target {
    arn      = "arn:aws:scheduler:::aws-sdk:ec2:startInstances"
    role_arn = aws_iam_role.eventbridge_scheduler_role.arn

    input = jsonencode({
      InstanceIds = [aws_instance.web_server.id]
    })
  }

  description = "Start EC2 instance at 6 AM ET (11:00 UTC) daily"
}
