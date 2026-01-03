# Jonathan Wilson 90s Website - Next.js Implementation

A classic 90s-style terminal website built with Next.js and deployed on AWS infrastructure using Terraform and Ansible. Features a Three.js visualization background with custom GLSL shaders.

## Tech Stack

### Frontend
- **Framework**: Next.js 16.1.1 with TypeScript
- **Build**: Static export (`output: 'export'`)
- **Styling**: CSS Modules + Global CSS
- **3D Graphics**: Three.js r128 with custom GLSL shaders
- **Theme**: 90s terminal aesthetic (green on black)

### Infrastructure
- **EC2**: t4g.small instance (Graviton ARM64)
- **OS**: Amazon Linux 2023 ARM64
- **Web Server**: Nginx (serves static files from Next.js build)
- **CDN**: CloudFront with free SSL/TLS
- **State Management**: S3 backend with versioning
- **Configuration**: Ansible with AWS Systems Manager
- **CI/CD**: GitHub Actions

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  GitHub Actions (CI/CD)                             │
│  ├─ Build Next.js → Static Export (out/)           │
│  ├─ Upload Artifacts                                │
│  └─ Deploy via Ansible                              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  AWS CloudFront (CDN)                               │
│  └─ HTTPS, Edge Caching, DDoS Protection           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  EC2 Instance (t4g.small ARM64)                     │
│  ├─ Nginx → /var/www/html/                         │
│  └─ Static files from Next.js build (out/)         │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

### Local Development
1. **Node.js** 18+ and npm
2. **Git** for version control

### Infrastructure Deployment
1. **AWS CLI** configured with credentials
2. **Terraform** 1.14+ installed
3. **Ansible** with `amazon.aws` collection
4. **Python** 3.8+ with boto3
5. **AWS Session Manager Plugin** (for server access)

## Local Development

### First Time Setup

```bash
# Clone the repository
cd personal-page-nextjs

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the site.

### Development Commands

```bash
npm run dev        # Start dev server with hot reload
npm run build      # Build static export to out/
npm run start      # Preview production build locally
```

### Project Structure

```
personal-page-nextjs/
├── app/
│   ├── components/
│   │   ├── ThreeScene/          # Three.js visualization
│   │   │   ├── ThreeScene.tsx   # Main component (366 lines)
│   │   │   └── ThreeScene.module.css
│   │   ├── TerminalWindow/      # Terminal UI container
│   │   ├── InfoContent/         # Main content
│   │   ├── TypedCommand/        # Typing animation
│   │   └── Footer/              # Footer with interactions
│   ├── globals.css              # Global styles + design tokens
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── public/                      # Static assets
├── out/                         # Build output (31 files)
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Infrastructure Deployment

### Initial Setup (One Time)

#### Step 1: Setup S3 Backend

```bash
cd terraform
terraform init
terraform apply -auto-approve
```

This creates the S3 bucket for Terraform state.

#### Step 2: Deploy Infrastructure

```bash
cd terraform
terraform plan
terraform apply
```

This creates:
- VPC with public subnet
- Internet Gateway
- Security Group (HTTP/HTTPS only)
- EC2 Instance (t4g.small ARM64)
- Elastic IP
- CloudFront distribution
- IAM roles for Systems Manager
- S3 bucket for state

#### Step 3: Build and Deploy Website

```bash
# Build Next.js application
cd personal-page-nextjs
npm install
npm run build

# Deploy to EC2 via Ansible
cd ../ansible
ansible-playbook -i inventory/hosts playbook.yml
```

#### Step 4: Invalidate CloudFront Cache

```bash
cd terraform
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_id) \
  --paths "/*"
```

### Automated Deployment (GitHub Actions)

Push to `main` branch triggers:

1. **Build Next.js** - Static export to `out/` directory
2. **Upload Artifacts** - Build output stored
3. **Deploy Website** - Ansible syncs `out/` to EC2
4. **Invalidate Cache** - CloudFront cache cleared

Required GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DOMAIN_NAME` (optional)
- `ACM_CERTIFICATE_ARN` (required if DOMAIN_NAME is set)

## Updating the Website

### Option 1: Via GitHub Actions (Recommended)

```bash
# Make your changes in personal-page-nextjs/
git add .
git commit -m "Update website content"
git push origin main
```

GitHub Actions will automatically:
1. Build the Next.js app
2. Deploy to EC2
3. Invalidate CloudFront cache

### Option 2: Manual Deployment

```bash
# 1. Build Next.js
cd personal-page-nextjs
npm run build

# 2. Deploy via Ansible
cd ../ansible
ansible-playbook -i inventory/hosts playbook.yml

# 3. Invalidate CloudFront cache
./scripts/invalidate-cache.sh
```

### Option 3: Quick Content Update

If you only changed content (no dependencies):

```bash
cd personal-page-nextjs
npm run build

cd ../ansible
ansible-playbook -i inventory/hosts playbook.yml --tags deploy
```

## Build Output

Next.js static export generates:

```
out/
├── index.html              # Main page
├── _next/
│   ├── static/             # JavaScript chunks
│   │   └── chunks/         # Code-split bundles
│   └── ...
├── favicon.ico
└── ...                     # ~31 files total
```

**Build Size**: ~287.6 KB gzipped (43% under 500KB target)

## Terraform Outputs

```bash
cd terraform
terraform output
```

Available outputs:
- `cloudfront_url` - CloudFront HTTPS URL (primary)
- `cloudfront_id` - Distribution ID (for cache invalidation)
- `web_server_public_ip` - EC2 instance public IP
- `instance_id` - EC2 instance ID (for SSM access)

## State Management

- **Backend**: S3 bucket `jonathan-wilson-terraform-state` (us-east-1)
- **Locking**: S3 use_lockfile (Terraform 1.14+)
- **Encryption**: Server-side encryption enabled
- **Versioning**: Enabled for rollback capability

## Server Access (No SSH Required)

Access EC2 instance via AWS Systems Manager:

```bash
# Get instance ID
cd terraform
INSTANCE_ID=$(terraform output -raw instance_id)

# Start SSM session
aws ssm start-session --target $INSTANCE_ID

# Inside the session:
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
ls -la /var/www/html/
```

## Rollback Procedures

See `plans/06-deployment/rollback-procedure.md` for detailed rollback options:

1. **GitHub Actions Re-run** - Revert commit and re-deploy
2. **Ansible Local Rollback** - Deploy previous build from local machine
3. **Manual Nginx Rollback** - Use backup directory on EC2
4. **Infrastructure Rollback** - Revert Terraform state

## CloudFront Cache Management

### Invalidate All Content

```bash
./scripts/invalidate-cache.sh
```

### Check Deployment Status

```bash
cd terraform
aws cloudfront get-distribution \
  --id $(terraform output -raw cloudfront_id) \
  --query 'Distribution.Status'
```

Wait until status is `Deployed` (5-15 minutes).

### Verify Cache Invalidation

```bash
aws cloudfront list-invalidations \
  --distribution-id $(terraform output -raw cloudfront_id)
```

## Customization

### Change Instance Size

Edit `terraform/variables.tf`:

```hcl
variable "instance_type" {
  default = "t4g.micro"  # Smaller ($7/month)
  # or
  default = "t4g.medium" # Larger ($30/month)
}
```

### Change Region

Edit `terraform/variables.tf`:

```hcl
variable "aws_region" {
  default = "us-west-2"  # Change region
}
```

### Customize Content

Edit files in `personal-page-nextjs/app/components/`:
- `InfoContent/InfoContent.tsx` - Main content (bio, projects, skills)
- `ThreeScene/ThreeScene.tsx` - Three.js visualization
- `globals.css` - Colors, fonts, responsive breakpoints

## Infrastructure Teardown

### Destroy AWS Resources

```bash
./scripts/destroy.sh
```

This removes:
- CloudFront distribution
- EC2 instance
- Elastic IP
- VPC and networking
- Security groups

### Remove State Backend (Optional)

```bash
aws s3 rb s3://jonathan-wilson-terraform-state --force
```

⚠️ **Warning**: This deletes Terraform state history.

## Cost Estimate

Monthly costs (approximate):

| Resource | Cost |
|----------|------|
| t4g.small EC2 (ARM64) | ~$15/month |
| CloudFront | ~$1-2/month |
| Elastic IP | Free (while attached) |
| S3 state storage | < $0.10/month |
| **Total** | **~$16-17/month** |

## Security Features

- ✅ No SSH required - Uses AWS Systems Manager
- ✅ Only HTTP/HTTPS ports exposed
- ✅ HTTPS via CloudFront with free TLS certificate
- ✅ DDoS protection (CloudFront)
- ✅ Encrypted S3 backend
- ✅ No secrets in repository
- ✅ IAM role-based access

## Performance Metrics

- **Bundle Size**: 287.6 KB gzipped
- **Build Time**: ~1.5s TypeScript compile + ~250ms static generation
- **Lighthouse Performance**: ≥90 (target)
- **Lighthouse Accessibility**: ≥90 (target)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s

## Troubleshooting

### Next.js Build Issues

```bash
# Clear cache and rebuild
cd personal-page-nextjs
rm -rf .next out node_modules
npm install
npm run build
```

### Deployment Issues

```bash
# Check GitHub Actions logs
# Visit: https://github.com/YOUR_USERNAME/personal-page/actions

# Verify Ansible connection
cd ansible
ansible all -i inventory/hosts -m ping

# Check EC2 instance logs
aws ssm start-session --target $(terraform output -raw instance_id)
sudo tail -f /var/log/nginx/error.log
```

### CloudFront Issues

```bash
# Check distribution status
cd terraform
aws cloudfront get-distribution \
  --id $(terraform output -raw cloudfront_id) \
  --query 'Distribution.Status'

# Verify origin configuration
aws cloudfront get-distribution \
  --id $(terraform output -raw cloudfront_id) \
  --query 'Distribution.DistributionConfig.Origins'
```

### Three.js Not Visible

- Check browser console for errors
- Verify WebGL support: Visit `chrome://gpu` or `about:support` (Firefox)
- Check mobile view: Three.js is hidden on screens ≤768px

## Project Documentation

- **Requirements**: `plans/requirements.md` - Full project requirements
- **Roadmap**: `plans/roadmap.md` - Phased implementation plan
- **Baseline**: `plans/00-preparation/baseline/` - Original specifications
- **Devlogs**: `devlog/` - Phase completion logs
- **Cleanup**: `plans/phase6.5-cleanup-completion.md` - Repository cleanup

## Migration History

This site was migrated from a static HTML file to Next.js:

- **Original**: `website/jonathan-wilson-90s.html` (single 500+ line file)
- **Migration**: 8 phases (Preparation → Documentation & Cleanup)
- **Completion**: 2026-01-03
- **Visual Parity**: 100% (105/105 baseline specifications matched)

See `plans/roadmap.md` for complete migration timeline.

## Support

For issues:

1. Check GitHub Actions logs
2. Review Terraform outputs: `cd terraform && terraform output`
3. Check EC2 instance via SSM
4. Verify CloudFront status
5. Review deployment logs: `devlog/`

## License

Personal portfolio website - All rights reserved.
