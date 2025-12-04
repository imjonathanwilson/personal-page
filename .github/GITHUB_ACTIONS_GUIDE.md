# GitHub Actions CI/CD Guide

## Overview

This repository uses GitHub Actions for automated infrastructure deployment and website updates.

## Workflow File

- **Location:** `.github/workflows/deploy.yml`
- **Triggers:** Push to main/master, Pull Requests, Manual dispatch

## Setup Instructions

### 1. Configure GitHub Secrets

Before the workflow can run, you need to set up AWS credentials as GitHub secrets.

**Go to:** Repository → Settings → Secrets and variables → Actions

**Add these secrets:**

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | `wJalrXUtnFEMI/K7MDENG/...` |

📖 See [SECRETS.md](.github/SECRETS.md) for detailed setup instructions.

### 2. Enable GitHub Actions

Make sure GitHub Actions is enabled for your repository:
- Go to Repository → Settings → Actions → General
- Select "Allow all actions and reusable workflows"

### 3. Set Up Environment (Optional but Recommended)

For production protection:
1. Go to Repository → Settings → Environments
2. Create a new environment called `production`
3. Add protection rules:
   - ✅ Required reviewers (select yourself or team members)
   - ✅ Wait timer: 5 minutes (optional delay)

## How It Works

### Workflow Jobs

The workflow consists of 4 sequential jobs:

```mermaid
graph TD
    A[Terraform Plan] --> B[Terraform Apply]
    B --> C[Deploy Website]
    C --> D[Invalidate CloudFront]
```

#### 1. **Terraform Plan** (Always runs)
- Formats and validates Terraform code
- Generates execution plan
- Runs on: All pushes and pull requests

#### 2. **Terraform Apply** (Main branch only)
- Applies infrastructure changes
- Creates/updates AWS resources
- Requires: Manual approval (if environment protection enabled)

#### 3. **Deploy Website** (Main branch only)
- Runs Ansible playbook
- Deploys website to EC2
- Configures Nginx

#### 4. **Invalidate CloudFront** (Main branch only)
- Clears CloudFront CDN cache
- Ensures latest content is served

## Usage Examples

### Deploy Website Changes

```bash
# 1. Make changes to website
vim website/jonathan-wilson-90s.html

# 2. Commit and push to main branch
git add website/jonathan-wilson-90s.html
git commit -m "Update website content"
git push origin main

# 3. GitHub Actions will automatically:
#    - Run Terraform plan & apply
#    - Deploy website via Ansible
#    - Invalidate CloudFront cache
```

### Test Infrastructure Changes (Pull Request)

```bash
# 1. Create a new branch
git checkout -b update-infrastructure

# 2. Make changes to Terraform
vim terraform/main.tf

# 3. Push and create PR
git add terraform/main.tf
git commit -m "Update EC2 instance type"
git push origin update-infrastructure

# 4. Create PR on GitHub
# GitHub Actions will run Terraform plan only (no apply)

# 5. Review the plan in PR comments
# 6. Merge PR to deploy changes
```

### Manual Deployment

Trigger the workflow manually without code changes:

1. Go to Actions tab in GitHub
2. Select "Deploy Infrastructure and Website"
3. Click "Run workflow"
4. Select branch (usually `main`)
5. Click "Run workflow"

## Monitoring Deployments

### View Workflow Runs

1. Go to **Actions** tab
2. Click on a workflow run to see details
3. Click on individual jobs to see logs

### Check Deployment Status

Each job shows:
- ✅ Success (green checkmark)
- ❌ Failure (red X)
- 🟡 In Progress (yellow circle)
- ⏸️ Waiting (gray circle, if approval required)

### Artifacts

Terraform plans are saved as artifacts:
- Available for 5 days
- Download from workflow run page
- Useful for debugging

## Troubleshooting

### Workflow Fails at "Terraform Init"

**Problem:** Backend state bucket doesn't exist or no permissions

**Solution:**
```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://your-terraform-state-bucket --region us-east-1
```

### Workflow Fails at "Configure AWS Credentials"

**Problem:** GitHub secrets not set or incorrect

**Solution:**
1. Verify secrets are set: Settings → Secrets → Actions
2. Check AWS credentials are valid:
   ```bash
   aws sts get-caller-identity
   ```

### Ansible Playbook Fails with "Unreachable Host"

**Problem:** SSM agent not ready or missing permissions

**Solution:**
- Wait 2-3 minutes after infrastructure creation
- Check EC2 instance has SSM IAM role
- Verify instance is in "running" state

### CloudFront Invalidation Fails

**Problem:** CloudFront distribution not found

**Solution:**
- Ensure Terraform applied successfully
- Check CloudFront distribution exists in AWS Console
- Verify `cloudfront_id` output in Terraform

## Advanced Configuration

### Customize AWS Region

Edit `.github/workflows/deploy.yml`:

```yaml
env:
  AWS_REGION: us-west-2  # Change region here
```

### Change Terraform Version

```yaml
env:
  TERRAFORM_VERSION: 1.7.0  # Update version
```

### Add Slack Notifications

Add this step at the end of each job:

```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "Deployment ${{ job.status }}"
      }
```

### Matrix Builds (Multiple Environments)

```yaml
strategy:
  matrix:
    environment: [staging, production]
```

## Best Practices

### 1. Use Pull Requests

- ✅ Always create PRs for infrastructure changes
- ✅ Review Terraform plans before merging
- ❌ Never push directly to main

### 2. Test Locally First

```bash
# Test Terraform changes
cd terraform
terraform plan

# Test Ansible playbook
cd ansible
ansible-playbook playbook.yml --check
```

### 3. Monitor Costs

- Review AWS Cost Explorer regularly
- Set up billing alerts
- Check if resources are properly sized

### 4. Security

- Rotate AWS credentials every 90 days
- Use least privilege IAM policies
- Enable GitHub secret scanning
- Review CloudTrail logs monthly

### 5. Rollback Strategy

If deployment fails:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or manually rollback in AWS Console
```

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Terraform GitHub Actions](https://github.com/hashicorp/setup-terraform)
- [AWS Actions](https://github.com/aws-actions)

## Support

For issues:
1. Check workflow logs in Actions tab
2. Review [SECRETS.md](SECRETS.md) for configuration
3. Open an issue in this repository
