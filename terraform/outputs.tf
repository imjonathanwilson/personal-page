output "web_server_public_ip" {
  description = "Public IP address of the web server"
  value       = aws_eip.web_server.public_ip
}

output "web_server_public_dns" {
  description = "Public DNS of the web server"
  value       = aws_instance.web_server.public_dns
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.web_server.id
}

output "ami_id" {
  description = "AMI ID used for the instance"
  value       = data.aws_ami.amazon_linux_2023_arm64.id
}

output "ami_name" {
  description = "AMI name used for the instance"
  value       = data.aws_ami.amazon_linux_2023_arm64.name
}

output "website_url" {
  description = "URL to access the website (direct)"
  value       = "http://${aws_eip.web_server.public_ip}"
}

output "cloudfront_url" {
  description = "CloudFront URL (HTTPS enabled, recommended)"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "cloudfront_domain" {
  description = "CloudFront domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.website.id
}
