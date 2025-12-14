# Project Context for AI Assistants

## Important: Check Devlogs

**ALWAYS check the `/devlog` directory for additional context, troubleshooting history, and solutions to known issues before starting work.**

The devlog contains documented issues, fixes, and important learnings that provide critical context for working on this project.

## Documentation Policy

**DO NOT create random .md files for documentation.** Instead:
- Put setup instructions, how-tos, and user-facing documentation in the main **README.md**
- Put troubleshooting and issue resolution in the **`/devlog`** directory (timestamped entries)
- Only create separate .md files if explicitly requested by the user

Keep documentation consolidated in README.md to avoid file sprawl.

## Project Overview

**Name**: Jonathan Wilson Personal Website
**Type**: Static website with cost-optimized AWS infrastructure
**Purpose**: Personal portfolio/landing page with 90s retro terminal aesthetic
**Deployment**: Automated via GitHub Actions with Terraform IaC

## Architecture

### Infrastructure Stack
- **Compute**: AWS EC2 t4g.small (ARM64 Graviton, Amazon Linux 2023)
- **CDN**: AWS CloudFront with origin failover
- **Storage**: S3 for maintenance page and Terraform state
- **Networking**: VPC with public subnet, Elastic IP, security groups
- **Web Server**: Nginx with gzip compression and cache headers
- **Configuration Management**: Ansible via AWS Systems Manager (SSM)
- **Automation**: EventBridge Scheduler for cost savings
- **IaC**: Terraform (>= 1.0, AWS provider ~> 5.0)
- **CI/CD**: GitHub Actions

### Cost Optimization Features
- **Automated Scheduling**: EC2 runs 6 AM - 11 PM ET daily (17 hours)
- **Origin Failover**: CloudFront serves S3 maintenance page when EC2 is offline
- **Monthly Cost**: ~$11-12 (down from $16-17, 30-35% savings)

### Architecture Flow
```
User → CloudFront → Origin Group → [Primary: EC2 | Failover: S3]
                         ↓
                   Nginx → Static HTML
```

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml                    # GitHub Actions CI/CD pipeline
├── ansible/
│   ├── ansible.cfg                       # Ansible configuration
│   ├── playbook.yml                      # Server configuration playbook
│   ├── inventory/                        # Dynamic inventory from Terraform
│   └── templates/
│       └── nginx.conf.j2                 # Nginx configuration template
├── devlog/                               # Development logs and troubleshooting history
│   └── *.md                              # Timestamped issue documentation
├── scripts/
│   ├── 01-setup-backend.sh               # Create S3 backend
│   ├── 02-deploy-infrastructure.sh       # Terraform deployment
│   ├── 03-configure-server.sh            # Run Ansible
│   ├── destroy.sh                        # Teardown infrastructure
│   └── invalidate-cache.sh               # CloudFront cache invalidation
├── terraform/
│   ├── main.tf                           # Core infrastructure (VPC, EC2)
│   ├── cloudfront.tf                     # CloudFront with origin groups
│   ├── s3.tf                             # S3 bucket for maintenance page
│   ├── scheduler.tf                      # EventBridge start/stop schedules
│   ├── iam.tf                            # IAM roles and policies
│   ├── variables.tf                      # Input variables
│   ├── outputs.tf                        # Output values
│   └── templates/
│       └── inventory.tpl                 # Ansible inventory template
├── terraform-backend/
│   └── main.tf                           # S3 backend bucket configuration
├── website/
│   ├── jonathan-wilson-90s.html          # Main website (90s terminal theme)
│   └── maintenance.html                  # Offline maintenance page
├── COST_SAVINGS.md                       # Cost optimization documentation
├── DOMAIN_SETUP.md                       # Custom domain setup guide
├── QUICKSTART.md                         # Quick start guide
├── README.md                             # Main project documentation
└── UPDATE-IAM-POLICY.md                  # IAM policy update instructions
```

## Key Files Explained

### Terraform Files

**main.tf** (Lines 1-173)
- VPC, subnet, internet gateway, route table
- Security group (HTTP/HTTPS ingress)
- EC2 instance with Elastic IP
- Latest Amazon Linux 2023 ARM64 AMI lookup

**cloudfront.tf** (Lines 1-68)
- CloudFront distribution with two origins:
  - Primary: EC2 instance (HTTP-only backend)
  - Failover: S3 maintenance page
- Origin group with automatic failover on 5xx errors
- HTTPS redirect, gzip compression
- Optional custom domain support with ACM certificate

**s3.tf** (Lines 1-59)
- S3 bucket for maintenance page
- Public read access for CloudFront
- Website configuration
- Automatic upload of maintenance.html

**scheduler.tf** (Lines 1-55)
- EventBridge Scheduler for start/stop
- Stop: 04:00 UTC (11 PM ET) daily
- Start: 11:00 UTC (6 AM ET) daily
- Uses IAM role for EC2 permissions

**iam.tf** (Lines 1-79)
- EC2 SSM role for Systems Manager access (no SSH needed)
- EventBridge Scheduler role for EC2 start/stop
- Instance profile for EC2

**variables.tf**
- `project_name`: Default "jonathan-wilson-personal-page"
- `aws_region`: Default "us-east-1"
- `instance_type`: Default "t4g.small"
- `vpc_cidr`: Default "10.0.0.0/16"
- `domain_name`: Optional custom domain
- `acm_certificate_arn`: Optional ACM cert ARN

**outputs.tf**
- EC2 instance details (ID, IP, DNS)
- CloudFront URL and domain
- S3 maintenance bucket info
- Schedule information

### Ansible Files

**playbook.yml**
- Install packages: nginx, git, python3-pip
- Configure Nginx from template
- Deploy website HTML to /var/www/html/
- Configure firewall (firewalld)
- Start and enable services

**templates/nginx.conf.j2**
- Nginx configuration with optimizations
- Gzip compression (min 1024 bytes)
- Cache headers for static assets (1 year TTL)
- Client max body size: 10MB

### Website Files

**jonathan-wilson-90s.html** (24.6 KB)
- Single-page website with embedded CSS/JS
- 90s terminal theme (green on black)
- Retro ASCII art and styling
- Responsive design

**maintenance.html**
- Clean, modern maintenance page
- Purple gradient background
- Shows operating hours (6 AM - 11 PM ET)
- Mobile responsive

### CI/CD Files

**.github/workflows/deploy.yml**
- **Triggers**: Push to main/master, PRs, manual dispatch
- **Jobs**:
  1. `terraform-plan`: Validate and plan changes
  2. `terraform-apply`: Apply infrastructure (requires approval)
  3. `deploy-website`: Run Ansible playbook via SSM
  4. `invalidate-cloudfront`: Clear CloudFront cache

**Required Secrets**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DOMAIN_NAME` (optional)
- `ACM_CERTIFICATE_ARN` (optional, required if domain set)

## Common Tasks

### Initial Setup
```bash
# 1. Create S3 backend for Terraform state
./scripts/01-setup-backend.sh

# 2. Deploy infrastructure
cd terraform
terraform init
terraform plan
terraform apply

# 3. Configure server with Ansible
cd ..
./scripts/03-configure-server.sh
```

### Deploy Updates
```bash
# Infrastructure changes
cd terraform
terraform plan
terraform apply

# Website content changes
cd ansible
ansible-playbook -i inventory/hosts playbook.yml

# Invalidate CloudFront cache
cd ..
./scripts/invalidate-cache.sh
```

### Manual EC2 Control
```bash
# Stop instance
aws ec2 stop-instances --instance-ids $(terraform output -raw instance_id)

# Start instance
aws ec2 start-instances --instance-ids $(terraform output -raw instance_id)

# Check status
aws ec2 describe-instances --instance-ids $(terraform output -raw instance_id) \
  --query 'Reservations[0].Instances[0].State.Name' --output text
```

### Modify Schedule
Edit `terraform/scheduler.tf`:
```hcl
# Cron format: cron(minute hour day month day-of-week year)
# Times in UTC

# Example: 9 AM - 6 PM ET
# Start: cron(0 14 * * ? *)  # 14:00 UTC = 9 AM ET
# Stop:  cron(0 23 * * ? *)  # 23:00 UTC = 6 PM ET

# Weekdays only: Add MON-FRI
# cron(0 14 ? * MON-FRI *)
```

### Teardown
```bash
./scripts/destroy.sh
# Then manually delete S3 backend bucket if needed
```

## Technology Details

### AWS Services Used
- **EC2**: Compute (t4g.small Graviton ARM64)
- **VPC**: Networking
- **CloudFront**: CDN with origin failover
- **S3**: Static hosting and Terraform state
- **EventBridge Scheduler**: Automated start/stop
- **IAM**: Security and permissions
- **Systems Manager (SSM)**: Server access without SSH
- **ACM**: SSL certificates (optional)

### Tools & Frameworks
- **Terraform**: v1.6.0+, AWS provider v5.100.0
- **Ansible**: v2.15+, Python 3.12
- **Nginx**: Latest from Amazon Linux 2023
- **GitHub Actions**: CI/CD automation
- **AWS CLI**: v2.x for manual operations

### Security Features
- No SSH access (SSM only)
- Security group allows only HTTP/HTTPS
- S3 state encryption with versioning
- CloudFront HTTPS with TLS 1.2+
- IAM roles instead of access keys
- Principle of least privilege

## Important Notes

### Cost Considerations
- **Scheduled downtime**: 7 hours/day (11 PM - 6 AM ET)
- **Elastic IP**: Free while associated, $0.005/hr if unassociated
- **CloudFront**: Free tier 1 TB/month outbound, then $0.085/GB
- **S3**: Pennies per month for maintenance page
- **EventBridge**: $1.00/million executions (2/day = $0.06/month)

### Caching Behavior
- **CloudFront default TTL**: 1 hour (3600 seconds)
- **CloudFront max TTL**: 24 hours (86400 seconds)
- **Nginx static assets**: 1 year (immutable)
- After EC2 starts, site may show maintenance page for up to 1 hour due to cache
- Force immediate update: `./scripts/invalidate-cache.sh`

### Failover Behavior
- CloudFront fails over on: 500, 502, 503, 504 errors
- Failover is automatic (no manual intervention)
- When EC2 stops, nginx returns 502/503 → CloudFront serves S3
- When EC2 starts, CloudFront routes to EC2 after health checks pass

### Time Zone Notes
- **All cron expressions in UTC**
- Eastern Time = UTC-5 (EST) or UTC-4 (EDT during DST)
- Scheduler doesn't account for DST automatically
- Consider using UTC times consistently

### SSH and Access
- **No SSH**: Use AWS Systems Manager Session Manager instead
- **SSM Command**: `aws ssm start-session --target INSTANCE_ID`
- **SSM Requirements**: Instance needs internet access and SSM agent (pre-installed on AL2023)
- **Ansible Connection**: Uses SSM plugin, not SSH

### Terraform State
- **Backend**: S3 bucket `jonathan-wilson-terraform-state`
- **Encryption**: AES256 at rest
- **Versioning**: Enabled
- **Locking**: Not configured (consider DynamoDB for team use)
- **Access**: Ensure AWS credentials have S3 access

### GitHub Actions Considerations
- **Production environment**: Requires manual approval before `terraform apply`
- **Secrets**: Must be set in GitHub repository settings
- **SSM Wait**: 60-second delay for SSM agent availability after EC2 creation
- **CloudFront**: Invalidation runs after deployment (costs $0.005 per invalidation beyond first 1000/month)

## Troubleshooting

### Instance won't start/stop on schedule
1. Check scheduler status: `aws scheduler get-schedule --name jonathan-wilson-personal-page-start-ec2`
2. Verify IAM role permissions in `terraform/iam.tf`
3. Check CloudWatch Logs for execution errors

### Maintenance page not showing when stopped
1. Verify S3 bucket public access: `aws s3 ls s3://$(terraform output -raw maintenance_bucket_name)/`
2. Check CloudFront origin group configuration
3. Test S3 website endpoint directly

### Ansible can't connect to instance
1. Ensure instance is running: `aws ec2 describe-instances --instance-ids INSTANCE_ID`
2. Wait 60 seconds after instance start for SSM agent
3. Check SSM agent status: `aws ssm describe-instance-information --instance-information-filter-list "key=InstanceIds,valueSet=INSTANCE_ID"`
4. Verify IAM instance profile attached

### CloudFront shows old content
- Default cache TTL is 1 hour
- Run invalidation: `./scripts/invalidate-cache.sh`
- Or wait for natural TTL expiration

### Terraform state locked
- S3 backend doesn't include DynamoDB locking
- If using DynamoDB, check lock table
- Force unlock (dangerous): `terraform force-unlock LOCK_ID`

## Development Workflow

### Making Infrastructure Changes
1. Edit Terraform files in `terraform/`
2. Run `terraform plan` to preview changes
3. Run `terraform apply` to apply changes
4. Commit and push to trigger GitHub Actions

### Updating Website Content
1. Edit `website/jonathan-wilson-90s.html`
2. Run Ansible playbook: `./scripts/03-configure-server.sh`
3. Invalidate CloudFront cache: `./scripts/invalidate-cache.sh`
4. Or push to main branch to trigger automated deployment

### Updating Maintenance Page
1. Edit `website/maintenance.html`
2. Run `terraform apply` (uploads to S3)
3. Test by stopping EC2 instance

### Testing Failover
```bash
# Stop instance
aws ec2 stop-instances --instance-ids $(terraform output -raw instance_id)

# Wait 30 seconds
sleep 30

# Visit CloudFront URL - should see maintenance page
curl -I https://$(terraform output -raw cloudfront_domain)

# Start instance
aws ec2 start-instances --instance-ids $(terraform output -raw instance_id)

# Wait 60 seconds for startup
sleep 60

# Should see main site (may need cache invalidation)
```

## Custom Domain Setup

To use a custom domain:

1. **Get ACM Certificate** (in us-east-1 for CloudFront):
   ```bash
   aws acm request-certificate \
     --domain-name yourdomain.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Set Terraform Variables**:
   ```bash
   export TF_VAR_domain_name="yourdomain.com"
   export TF_VAR_acm_certificate_arn="arn:aws:acm:us-east-1:..."
   ```

3. **Apply Terraform**:
   ```bash
   cd terraform
   terraform apply
   ```

4. **Update DNS** (Route53, Cloudflare, etc.):
   - Add CNAME: `yourdomain.com` → CloudFront domain
   - Or A/ALIAS record if using Route53

See `DOMAIN_SETUP.md` for detailed instructions.

## Future Enhancement Ideas

- **DynamoDB state locking**: Add state locking for team collaboration
- **Auto Scaling**: Add ASG if traffic increases
- **Multi-AZ**: Deploy across multiple availability zones
- **CloudWatch alarms**: Alert on instance stop/start failures
- **Logs aggregation**: Send nginx logs to CloudWatch Logs
- **WAF**: Add AWS WAF for security
- **Backup automation**: Automated AMI snapshots
- **Blue/green deployment**: Zero-downtime deployments
- **Custom error pages**: Branded 404/500 pages in S3

## Contact & Support

- **Repository**: Personal infrastructure project
- **Primary User**: Jonathan Wilson
- **AWS Region**: us-east-1 (N. Virginia)
- **Support**: See documentation files in project root

## Quick Reference

### URLs
- **CloudFront**: `https://$(terraform output -raw cloudfront_domain)`
- **Direct EC2**: `http://$(terraform output -raw web_server_public_ip)`
- **Maintenance Page**: `http://$(terraform output -raw maintenance_bucket_website_endpoint)`

### Important IDs
```bash
# Get instance ID
terraform output -raw instance_id

# Get CloudFront distribution ID
terraform output -raw cloudfront_id

# Get S3 bucket name
terraform output -raw maintenance_bucket_name
```

### Schedule
- **Start**: 6:00 AM ET (11:00 UTC) daily
- **Stop**: 11:00 PM ET (04:00 UTC) daily
- **Uptime**: 17 hours/day (71% duty cycle)

---

**Last Updated**: 2025-12-13 (Added documentation policy, devlog reference, Ansible SSM troubleshooting)
**Infrastructure Version**: Terraform 1.6.0+, AWS Provider 5.100.0
