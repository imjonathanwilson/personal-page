# GitHub Actions

## Setup

Add these secrets to your repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DOMAIN_NAME` (optional)
- `ACM_CERTIFICATE_ARN` (required if DOMAIN_NAME is set)

## How It Works

The workflow runs on pushes to main branch and consists of:
1. Terraform Plan - Validates and plans infrastructure changes
2. Terraform Apply - Applies infrastructure changes
3. Deploy Website - Configures server with Ansible
4. Invalidate CloudFront - Clears CDN cache
