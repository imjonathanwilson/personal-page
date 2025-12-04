# GitHub Secrets Setup

This document describes the GitHub secrets required for the CI/CD pipeline.

## Required Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### 1. AWS_ACCESS_KEY_ID

**Description:** AWS Access Key ID for programmatic access

**How to get it:**
```bash
aws configure get aws_access_key_id
```

Or create a new IAM user with programmatic access:
1. Go to AWS Console → IAM → Users → Add User
2. Select "Programmatic access"
3. Attach the following policies (or create a custom policy):
   - `AmazonEC2FullAccess`
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `IAMReadOnlyAccess` (for Terraform state)
   - `AmazonSSMFullAccess` (for Systems Manager)
4. Save the Access Key ID

**Value:** Your AWS Access Key ID (e.g., `AKIAIOSFODNN7EXAMPLE`)

---

### 2. AWS_SECRET_ACCESS_KEY

**Description:** AWS Secret Access Key for programmatic access

**How to get it:**
```bash
aws configure get aws_secret_access_key
```

Or use the secret from the IAM user creation above.

**Value:** Your AWS Secret Access Key (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

**⚠️ Security Note:** This is highly sensitive. Never commit this to your repository.

---

## Optional Secrets

### AWS_REGION

**Description:** AWS Region for deployment (defaults to `us-east-1`)

**Value:** Your preferred AWS region (e.g., `us-west-2`)

**Note:** This is already set as an environment variable in the workflow, but you can override it as a secret if needed.

---

## Setting Up Secrets via GitHub CLI

If you have the [GitHub CLI](https://cli.github.com/) installed:

```bash
# Set AWS Access Key ID
gh secret set AWS_ACCESS_KEY_ID

# Set AWS Secret Access Key
gh secret set AWS_SECRET_ACCESS_KEY
```

You'll be prompted to enter the values.

---

## Terraform Backend State

The workflow assumes you're using S3 for Terraform state backend. Make sure your backend is configured in `terraform/main.tf`:

```hcl
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}
```

The IAM user needs permissions to read/write to this S3 bucket.

---

## Environment Protection Rules (Optional)

For additional safety, set up environment protection rules:

1. Go to Repository → Settings → Environments
2. Click "production"
3. Enable "Required reviewers" - require manual approval before deployment
4. Enable "Wait timer" - add a delay before deployment

---

## Testing the Workflow

### Test Plan (Pull Request)
```bash
git checkout -b test-deployment
# Make changes
git add .
git commit -m "Test deployment"
git push origin test-deployment
# Create PR - workflow will run terraform plan only
```

### Deploy (Merge to Main)
```bash
git checkout main
git merge test-deployment
git push origin main
# Workflow will run terraform apply and deploy website
```

---

## Workflow Behavior

| Trigger | Terraform Plan | Terraform Apply | Ansible Deploy | CloudFront Invalidate |
|---------|----------------|-----------------|----------------|----------------------|
| Push to main/master | ✅ | ✅ | ✅ | ✅ |
| Pull Request | ✅ | ❌ | ❌ | ❌ |
| Manual Dispatch | ✅ | ✅ | ✅ | ✅ |

---

## Troubleshooting

### "Error: No valid credential sources found"
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set correctly
- Check the IAM user has necessary permissions

### "Error: error configuring Terraform AWS Provider: no valid credential sources for Terraform AWS Provider found"
- The IAM user credentials may be incorrect or expired
- Check if MFA is required (GitHub Actions doesn't support MFA)

### "Error: Failed to connect via SSM"
- Wait 2-3 minutes after instance creation for SSM agent to initialize
- Ensure the EC2 instance has the SSM IAM role attached
- Check the instance is in a "running" state

### Ansible fails with "unreachable host"
- The SSM Session Manager plugin might not be installed correctly
- Check the Ansible inventory file is generated correctly by Terraform
- Verify the instance ID in the inventory matches the actual instance

---

## Security Best Practices

1. **Rotate credentials regularly** - Change AWS access keys every 90 days
2. **Use least privilege** - Only grant necessary IAM permissions
3. **Enable GitHub secret scanning** - Detects accidentally committed secrets
4. **Use environment protection** - Require manual approval for production deployments
5. **Audit access logs** - Regularly review CloudTrail logs for AWS API calls
6. **Enable 2FA** - Require two-factor authentication for GitHub account

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Terraform Cloud for State Management](https://www.terraform.io/cloud) (Alternative to S3 backend)
