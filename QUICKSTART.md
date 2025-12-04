# Quick Start Guide

Deploy Jonathan Wilson's 90s website in 3 commands.

## Prerequisites

```bash
# 1. AWS CLI configured
aws configure

# 2. Terraform installed
terraform --version

# 3. Ansible installed with SSM support
pip install ansible ansible-pylibssh

# 4. AWS Session Manager Plugin
# Download from: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html
```

**Note:** No SSH keys needed - uses AWS Systems Manager!

## Deploy

```bash
cd jonathan-wilson-infra

# Step 1: Create S3 bucket for state
./scripts/01-setup-backend.sh

# Step 2: Deploy infrastructure (EC2, VPC, etc)
./scripts/02-deploy-infrastructure.sh

# Step 3: Configure web server and deploy website
./scripts/03-configure-server.sh
```

## Access

After deployment completes, visit the CloudFront URL (with HTTPS):

```
https://<CLOUDFRONT_DOMAIN>.cloudfront.net
```

**Note:** CloudFront takes 5-15 minutes to deploy. Use the direct HTTP URL while waiting:
```
http://<ELASTIC_IP>
```

## Destroy

```bash
./scripts/destroy.sh
```

## Architecture

- **Instance**: t4g.small (Graviton ARM64)
- **OS**: Amazon Linux 2023
- **Web Server**: Nginx
- **CDN**: CloudFront with free SSL/TLS
- **Backend**: S3 (encrypted, versioned)
- **Cost**: ~$16-17/month

## Customization

Edit `terraform/terraform.tfvars`:

```hcl
instance_type = "t4g.micro"    # Smaller/cheaper
aws_region    = "us-west-2"    # Different region
```

Then re-run:

```bash
./scripts/02-deploy-infrastructure.sh
```
