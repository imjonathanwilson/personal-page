# Custom Domain Setup Guide

This guide walks you through setting up a custom domain for your CloudFront-hosted website with SSL/TLS certificate.

## Overview

Your infrastructure supports two modes:
1. **CloudFront-only** (default): Uses CloudFront's default domain (e.g., `d1234567890.cloudfront.net`)
2. **Custom Domain**: Uses your own domain with free AWS SSL certificate (e.g., `example.com`)

## Prerequisites

- A domain name registered with any domain registrar (GoDaddy, Namecheap, Route53, etc.)
- Access to your domain's DNS settings
- AWS account with permissions for ACM and CloudFront

## Step 1: Request SSL Certificate in AWS Certificate Manager (ACM)

**IMPORTANT**: The certificate MUST be created in `us-east-1` region for CloudFront.

### Using AWS Console:

1. Go to AWS Certificate Manager: https://console.aws.amazon.com/acm/home?region=us-east-1
2. Click "Request certificate"
3. Choose "Request a public certificate"
4. Enter your domain names:
   - `example.com` (your root domain)
   - `www.example.com` (www subdomain)
5. Choose "DNS validation" (recommended)
6. Click "Request"

### Using AWS CLI:

```bash
aws acm request-certificate \
  --domain-name example.com \
  --subject-alternative-names www.example.com \
  --validation-method DNS \
  --region us-east-1
```

## Step 2: Validate Domain Ownership

After requesting the certificate, you need to prove you own the domain.

### DNS Validation (Recommended):

1. In ACM console, click on your certificate
2. You'll see DNS records that need to be added
3. Add CNAME records to your domain's DNS:
   - **Name**: `_abc123.example.com`
   - **Type**: CNAME
   - **Value**: `_xyz456.acm-validations.aws.`

**Note**: If using Route53, AWS can automatically add these records for you.

### Wait for Validation:

- DNS validation typically takes 5-30 minutes
- Certificate status will change from "Pending validation" to "Issued"
- You can proceed once status is "Issued"

## Step 3: Get Your ACM Certificate ARN

### Using AWS Console:

1. Go to ACM in us-east-1
2. Click on your certificate
3. Copy the ARN (looks like: `arn:aws:acm:us-east-1:123456789012:certificate/abc-123-def`)

### Using AWS CLI:

```bash
aws acm list-certificates --region us-east-1
```

## Step 4: Update Terraform Configuration

Edit `terraform/terraform.tfvars`:

```hcl
# Local development variables
# This file is ignored by git (.gitignore)

aws_profile = "terraform-deployer"

# Custom domain configuration (optional)
domain_name          = "example.com"
acm_certificate_arn  = "arn:aws:acm:us-east-1:123456789012:certificate/abc-123-def"
```

**Replace**:
- `example.com` with your actual domain
- The ARN with your actual certificate ARN from Step 3

## Step 5: Apply Terraform Changes

```bash
cd terraform
terraform plan  # Review changes
terraform apply  # Apply changes
```

This will update your CloudFront distribution to use your custom domain with SSL.

## Step 6: Update DNS Records

After Terraform apply completes, you need to point your domain to CloudFront.

### Get CloudFront Domain:

```bash
cd terraform
terraform output cloudfront_url
# Output: https://d1234567890.cloudfront.net
```

### Add DNS Records:

In your domain registrar's DNS settings, add these records:

**For root domain (example.com):**
- **Type**: A (if using Route53 with alias) or CNAME (other providers may require)
- **Name**: `@` or leave blank
- **Value**: `d1234567890.cloudfront.net` (your CloudFront domain without https://)
- **Note**: Some registrars don't allow CNAME for root domain. Consider using Route53 for better support.

**For www subdomain:**
- **Type**: CNAME
- **Name**: `www`
- **Value**: `d1234567890.cloudfront.net`

### Using Route53 (Recommended):

If using Route53, create ALIAS records instead:

```bash
# Get CloudFront distribution domain name
CLOUDFRONT_DOMAIN=$(cd terraform && terraform output -raw cloudfront_url | sed 's|https://||')

# Create alias records (pseudo-code - use console or AWS CLI)
# A record: example.com -> CloudFront distribution
# A record: www.example.com -> CloudFront distribution
```

## Step 7: Test Your Domain

Wait 5-15 minutes for DNS propagation, then test:

```bash
# Check DNS resolution
dig example.com
dig www.example.com

# Test HTTPS
curl -I https://example.com
curl -I https://www.example.com
```

Both should show:
- HTTP 200 status
- Valid SSL certificate
- Redirect to HTTPS if you access HTTP

## GitHub Actions Setup

To use custom domain in GitHub Actions, add these to GitHub Secrets:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `DOMAIN_NAME`: Your domain (e.g., `example.com`)
   - `ACM_CERTIFICATE_ARN`: Your certificate ARN

Then update `.github/workflows/deploy.yml` to pass these as Terraform variables:

```yaml
- name: Terraform Plan
  working-directory: terraform
  run: |
    terraform plan \
      -var="domain_name=${{ secrets.DOMAIN_NAME }}" \
      -var="acm_certificate_arn=${{ secrets.ACM_CERTIFICATE_ARN }}" \
      -out=tfplan
```

## Troubleshooting

### Certificate Not Validating
- Ensure DNS records are added correctly
- Wait up to 30 minutes for DNS propagation
- Check DNS with: `dig _abc123.example.com`

### CloudFront Shows Certificate Error
- Certificate MUST be in `us-east-1` region
- Certificate status must be "Issued" (not "Pending validation")
- Ensure ARN is correct in terraform.tfvars

### Domain Not Resolving
- Wait 5-15 minutes for DNS propagation
- Check DNS records are pointing to correct CloudFront domain
- Use `dig example.com` to verify DNS records

### "CNAMEAlreadyExists" Error
- Your domain is already associated with another CloudFront distribution
- Remove the domain from the other distribution first
- Or use a different subdomain

## Cost Considerations

- **ACM Certificate**: FREE
- **CloudFront with Custom Domain**: Same price as default CloudFront
- **Route53 Hosted Zone**: $0.50/month (if using Route53)
- **Route53 DNS Queries**: $0.40 per million queries

Using a custom domain doesn't increase your infrastructure costs significantly.

## Removing Custom Domain

To revert to CloudFront-only mode:

1. Edit `terraform/terraform.tfvars`:
   ```hcl
   domain_name = ""
   acm_certificate_arn = ""
   ```

2. Apply changes:
   ```bash
   cd terraform
   terraform apply
   ```

Your site will be accessible via the CloudFront default domain again.
