# Development Environment - 2026-01-01

## Local Environment

### Node.js
- **Version**: v24.11.1
- **Required**: v18.0.0+
- **Status**: ✅ Exceeds requirement
- **Installation**: System-wide

### npm
- **Version**: 11.6.2
- **Bundled with**: Node.js v24.11.1
- **Status**: ✅ Ready

### Git
- **Repository**: /home/jdubz/personal-page
- **Current Branch**: main
- **Status**: Clean working directory with untracked files

### Python
- **Expected**: 3.12 (from GitHub Actions workflow)
- **Usage**: Ansible execution (local Ansible runs if needed)

## GitHub Actions CI/CD Environment

### Runner
- **OS**: ubuntu-latest
- **Architecture**: x86_64 (AMD64)

### Configured Versions
- **Terraform**: 1.14.0
- **Python**: 3.12
- **Node.js**: 18.x (to be added in Phase 6)

### Actions Used
- `actions/checkout@v4`
- `aws-actions/configure-aws-credentials@v4`
- `hashicorp/setup-terraform@v3`
- `actions/setup-python@v5`
- `actions/upload-artifact@v4` (to be added)
- `actions/download-artifact@v4` (to be added)
- `actions/setup-node@v4` (to be added)

## EC2 Production Environment

### Instance Details
- **Instance Type**: t4g.small
- **Architecture**: ARM64 (Graviton)
- **OS**: Amazon Linux 2023
- **Region**: us-east-1

### Installed Software
- **Nginx**: Web server for static file serving
- **Python 3**: System Python
- **Git**: Version control
- **AWS SSM Agent**: Session Manager access

### Key Paths
- **Website Root**: `/var/www/html`
- **Nginx Config**: `/etc/nginx/nginx.conf`
- **Nginx User**: `nginx`

### Access Method
- **SSH**: Not configured
- **Systems Manager**: AWS Session Manager
- **Connection**: `aws ssm start-session --target <instance-id>`

## AWS Services

### CloudFront
- **Purpose**: CDN and SSL/TLS termination
- **Cache Behavior**: All content cached
- **Invalidation**: `/*` pattern on deployment

### S3
- **Terraform State**: jonathan-wilson-terraform-state (us-east-1)
- **State Locking**: S3 use_lockfile (Terraform 1.14+)
- **Versioning**: Enabled
- **Encryption**: Server-side encryption enabled

### IAM
- **EC2 Role**: SSM access permissions
- **GitHub Actions**: AWS credentials via secrets

## Repository Structure

```
/home/jdubz/personal-page/
├── .github/workflows/
│   └── deploy.yml               # CI/CD pipeline
├── terraform/                   # Infrastructure as Code
│   ├── main.tf
│   ├── cloudfront.tf
│   ├── s3.tf
│   ├── iam.tf
│   └── outputs.tf
├── ansible/                     # Configuration management
│   ├── playbook.yml
│   ├── inventory/hosts
│   └── templates/nginx.conf.j2
├── website/                     # Current static HTML
│   └── jonathan-wilson-90s.html
├── plans/                       # Migration planning docs
│   ├── requirements.md
│   ├── priorities.md
│   ├── roadmap.md
│   └── baseline/               # Phase 0 deliverables
│       ├── performance.md
│       ├── environment.md (this file)
│       └── infrastructure-analysis.md
├── openspec/                   # OpenSpec framework
│   ├── AGENTS.md
│   ├── project.md
│   ├── specs/
│   └── changes/
└── requirements.txt            # Python dependencies

Future structure (after Phase 1):
├── personal-page-nextjs/       # Next.js application
│   ├── app/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── out/                    # Static export output
```

## Dependencies

### Current Dependencies
```txt
# requirements.txt
ansible>=8.0.0
ansible-core>=2.15.0
boto3>=1.26.0
botocore>=1.29.0
```

### Next.js Dependencies (Phase 1)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "0.128.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/three": "^0.128.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

## Network Configuration

### Ports
- **HTTP**: 80 (via CloudFront)
- **HTTPS**: 443 (via CloudFront)
- **EC2 Direct**: Port 80 (behind CloudFront)

### DNS (if configured)
- **Domain**: Via GitHub secrets (optional)
- **ACM Certificate**: For HTTPS (optional)

## Security

### Secrets Management
GitHub repository secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DOMAIN_NAME` (optional)
- `ACM_CERTIFICATE_ARN` (optional)

### Firewall
- **EC2 Security Groups**: Configured via Terraform
- **Firewalld**: Configured via Ansible (HTTP/HTTPS)

## Development Workflow

### Current Workflow
1. Edit `website/jonathan-wilson-90s.html`
2. Commit and push to main
3. GitHub Actions deploys automatically
4. CloudFront cache invalidated
5. Changes live in ~5-10 minutes

### Next.js Workflow (Post-Migration)
1. Edit files in `personal-page-nextjs/`
2. Test locally: `npm run dev`
3. Build locally: `npm run build`
4. Commit and push to main
5. GitHub Actions builds and deploys
6. CloudFront cache invalidated
7. Changes live in ~5-10 minutes

## Testing Tools

### Available Locally
- Web browser (Chrome/Firefox for DevTools)
- Git for version control
- Node.js for local Next.js development

### Available in GitHub Actions
- Terraform for infrastructure validation
- Ansible for configuration management
- AWS CLI for CloudFront invalidation

### Recommended (for Phase 5)
- Chrome DevTools for Lighthouse audits
- Browser DevTools Device Mode for responsive testing
- Session Manager for EC2 debugging

## Environment Variables

### GitHub Actions (Set in workflow)
```yaml
env:
  AWS_REGION: us-east-1
  TERRAFORM_VERSION: 1.14.0
  PYTHON_VERSION: '3.12'
  # To be added in Phase 6:
  NODE_VERSION: '18'
```

### Ansible (Set in playbook)
```yaml
vars:
  website_dir: /var/www/html
  nginx_user: nginx
```

## Readiness Assessment

### Phase 0 Completion Status
- ✅ Node.js 18+ available (v24.11.1)
- ✅ npm available (11.6.2)
- ✅ Git repository accessible
- ✅ GitHub Actions workflow reviewed
- ✅ Ansible playbook reviewed
- ✅ Infrastructure documented
- ✅ Environment verified

### Ready for Phase 1
- ✅ All development tools available
- ✅ Infrastructure understood
- ✅ Deployment process documented
- ⏳ Waiting for Bob to complete visual baseline
- ⏳ Synchronization point before proceeding

## Notes

### Platform Differences
- **Local**: x86_64 Linux (WSL2)
- **GitHub Actions**: x86_64 Linux (Ubuntu)
- **EC2 Production**: ARM64 Linux (Amazon Linux 2023)

**Implication**: Next.js static export is platform-independent (static files only), so architecture differences don't affect deployment.

### Version Compatibility
- Node.js v24 locally can develop for Node.js v18 target (backward compatible)
- TypeScript strict mode ensures type safety
- Next.js 14 supports both architectures via static export

### Performance Considerations
- Local development on high-performance hardware
- GitHub Actions on standard runners (sufficient for build)
- EC2 t4g.small sufficient for static file serving via Nginx

### Storage
- **Local**: Sufficient disk space for development
- **EC2**: Monitor disk usage after Next.js deployment (static files larger than single HTML)
- **S3**: Terraform state small, no concerns

## Troubleshooting

### Common Issues

**Node.js version mismatch**:
```bash
# Check version
node --version

# Use nvm to switch versions (if needed)
nvm install 18
nvm use 18
```

**npm permissions**:
```bash
# Use npx for temporary command execution
npx create-next-app@latest

# Or fix npm global permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
```

**Ansible connection issues**:
```bash
# Verify SSM agent running
aws ssm describe-instance-information

# Test connection
ansible all -i inventory/hosts -m ping
```

**Git conflicts**:
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts
git status
```

## Phase 1 Prerequisites

Before Bob starts Phase 1:
1. ✅ Node.js 18+ confirmed
2. ✅ npm available
3. ✅ Workspace clean and ready
4. ⏳ Visual baseline complete (Bob)
5. ⏳ Synchronization point passed

**Status**: Environment ready for Phase 1 initialization.
