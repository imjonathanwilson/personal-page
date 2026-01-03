# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

You are an expert. Experts always look at the documentation before they try to use a library.

## Project Overview

This is a personal portfolio website infrastructure project that deploys a 90s-style static website on AWS. The infrastructure is managed as code using Terraform, with configuration management via Ansible, and automated deployment through GitHub Actions.

**Architecture**: EC2 (t4g.small ARM64) → Nginx → CloudFront CDN with SSL
**State**: S3 backend with versioning and encryption
**Access**: AWS Systems Manager Session Manager (no SSH required)

## Common Commands

### Infrastructure Management

```bash
# Terraform operations (run from terraform/ directory)
cd terraform
terraform init                    # Initialize Terraform
terraform plan                    # Preview changes
terraform apply                   # Apply infrastructure changes
terraform output                  # View outputs (CloudFront URL, IPs, IDs)
terraform output -raw <name>      # Get specific output value

# Validate and format
terraform validate                # Check configuration syntax
terraform fmt                     # Format .tf files
terraform fmt -check              # Check formatting without changes
```

### Configuration & Deployment

```bash
# Ansible deployment (run from ansible/ directory)
cd ansible
ansible-playbook -i inventory/hosts playbook.yml

# Environment setup
pip install -r requirements.txt   # Install Ansible + AWS dependencies
```

### CloudFront Cache Management

```bash
# Invalidate CloudFront cache after website updates
cd terraform
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_id) \
  --paths "/*"

# Check CloudFront deployment status
aws cloudfront get-distribution \
  --id $(terraform output -raw cloudfront_id) \
  --query 'Distribution.Status'
```

### OpenSpec Workflow

```bash
# List active changes and specs
openspec list                     # Active change proposals
openspec list --specs             # Current specifications
openspec spec list --long         # Detailed spec listing

# View specific items
openspec show <change-or-spec>    # View details
openspec show <change> --json --deltas-only  # Debug deltas

# Validation
openspec validate <change> --strict  # Validate proposal
openspec validate --strict           # Validate all

# Archive completed changes
openspec archive <change-id> --yes   # Archive after deployment
```

## Architecture & Infrastructure

### Deployment Pipeline

The project uses a multi-stage GitHub Actions pipeline:

1. **Terraform Plan**: Validates and plans infrastructure changes
2. **Terraform Apply**: Applies changes to AWS (main branch only)
3. **Deploy Website**: Uses Ansible over SSM to configure Nginx and deploy HTML
4. **Invalidate CloudFront**: Clears CDN cache for immediate updates

### Infrastructure Components

**Terraform modules** (in `terraform/`):
- `main.tf`: Core EC2, VPC, networking configuration
- `cloudfront.tf`: CloudFront distribution with SSL/TLS
- `iam.tf`: IAM roles for Systems Manager access
- `s3.tf`: S3 buckets for state and failover maintenance page
- `scheduler.tf`: EventBridge schedules (if applicable)
- `outputs.tf`: Exported values (URLs, IDs, IPs)

**Key architecture decisions**:
- ARM64 (Graviton) for cost efficiency
- Amazon Linux 2023 for latest security updates
- Systems Manager Session Manager instead of SSH for security
- CloudFront provides HTTPS, DDoS protection, and global edge caching
- S3 maintenance page as CloudFront origin failover

### Ansible Configuration

The Ansible playbook (`ansible/playbook.yml`) performs:
1. System package updates
2. Nginx installation and configuration
3. Website file deployment from `website/jonathan-wilson-90s.html`
4. Firewall configuration (HTTP/HTTPS)
5. Service management (start/enable nginx)

**Inventory**: Dynamically generated from Terraform outputs via `inventory/hosts`
**Connection**: Uses `aws_ssm` connection plugin (no SSH keys required)

### State Management

- **Backend**: S3 bucket `jonathan-wilson-terraform-state` in `us-east-1`
- **Locking**: S3 use_lockfile (Terraform 1.14+)
- **Encryption**: Server-side encryption enabled
- **Versioning**: Enabled for rollback capability

## GitHub Actions Secrets

Required repository secrets:
- `AWS_ACCESS_KEY_ID`: AWS credentials for Terraform and Ansible
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `DOMAIN_NAME`: (Optional) Custom domain
- `ACM_CERTIFICATE_ARN`: (Required if DOMAIN_NAME is set)

## Project Structure Context

```
/
├── terraform/              # Infrastructure as Code
│   ├── main.tf            # EC2, VPC, networking
│   ├── cloudfront.tf      # CDN configuration
│   ├── s3.tf              # State bucket + failover
│   ├── iam.tf             # SSM permissions
│   └── outputs.tf         # Exported values
├── ansible/               # Configuration management
│   ├── playbook.yml       # Server setup tasks
│   ├── inventory/hosts    # Dynamic inventory
│   └── templates/         # Nginx config templates
├── website/               # Static website files
│   └── jonathan-wilson-90s.html
├── openspec/              # Spec-driven development
│   ├── AGENTS.md          # Detailed OpenSpec workflow
│   ├── project.md         # Project conventions
│   ├── specs/             # Current specifications
│   └── changes/           # Proposed changes
├── plans/                 # Migration planning docs
│   ├── requirements.md    # Next.js migration requirements
│   ├── priorities.md      # Business analysis & priorities
│   └── roadmap.md         # Agent parallelization roadmap
└── .github/workflows/
    └── deploy.yml         # CI/CD pipeline
```

## Important Patterns

### Terraform Workflow Pattern

Always use Terraform outputs to pass data between jobs and to Ansible:
```bash
INSTANCE_ID=$(terraform output -raw instance_id)
CLOUDFRONT_ID=$(terraform output -raw cloudfront_id)
```

### Ansible Connection Pattern

Uses SSM instead of SSH. The inventory file references Terraform outputs:
```yaml
ansible_connection: aws_ssm
ansible_aws_ssm_region: us-east-1
```

### OpenSpec Change Workflow

1. **Proposal Stage**: Create `changes/<id>/` with proposal.md, tasks.md, and spec deltas
2. **Implementation Stage**: Execute tasks.md checklist, mark complete
3. **Archive Stage**: Move to `changes/archive/YYYY-MM-DD-<id>/` after deployment

**Critical**: Always validate with `openspec validate <change-id> --strict` before requesting approval.

### Scenario Format (OpenSpec)

Requirements MUST have at least one scenario with exact format:
```markdown
#### Scenario: Description
- **WHEN** condition
- **THEN** expected result
```

Use `## ADDED|MODIFIED|REMOVED|RENAMED Requirements` headers in delta files.

## Migration Planning (In Progress)

The project has comprehensive planning documents for a Next.js migration:
- `plans/requirements.md`: Full requirements specification
- `plans/priorities.md`: Business analysis using frameworks (RICE, SWOT, MoSCoW)
- `plans/roadmap.md`: Phased implementation with agent parallelization strategy

**Key insight**: Roadmap identifies high-parallelization phases (Phases 2-3, 5-6, 8) where 5-7 agents can work simultaneously on independent components.

## SSM Session Manager Access

To connect to the EC2 instance for debugging:
```bash
# Get instance ID from Terraform
cd terraform
INSTANCE_ID=$(terraform output -raw instance_id)

# Start SSM session
aws ssm start-session --target $INSTANCE_ID

# Inside the session, check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

## Website Update Workflow

1. Edit `website/jonathan-wilson-90s.html`
2. Commit and push to main branch
3. GitHub Actions automatically:
   - Runs Terraform plan (no changes expected)
   - Deploys website via Ansible
   - Invalidates CloudFront cache
4. Website updates propagate globally within minutes

## Troubleshooting

**CloudFront not updating**: Wait 5-15 minutes for distribution deployment, then run cache invalidation.

**Ansible fails to connect**: Verify SSM agent is running (60-second wait in pipeline). Check IAM role attachment.

**Terraform state locked**: Another operation in progress or crashed. Check S3 bucket for lock file.

**OpenSpec validation fails**: Use `--strict` flag for detailed errors. Verify scenario format uses `####` (4 hashtags).

Prefer raw SQL over SQLAlchemy except for model definition.

Always implement a centralized, robust logging module for each component of the project
Always use python if possible
Never use single-letter variable names
Use Playwright to check your work if creating a web-based project, always take a screenshot in between actions so you can be sure that the routes exist.

Every project should have a requirements.md file, and it should be in the /plans directory
Always make a plan, and save requirements and plans in the /plans directory. The main execution plan should be in plan.md
**Save markdown-formatted diary entries in /devlog**, under the feature name. Always check in plans and diary entries.


NEVER comment out existing features or functionality to "simplify for now" or "focus on testing." Instead:
- Create separate test files or scripts for isolated testing
- Use feature flags or configuration switches if you need to temporarily disable functionality
- Maintain all existing features while adding new ones
- If testing specific behavior, write a dedicated test harness that doesn't modify the main codebase


When writing tests, prioritize integration testing over heavily mocked unit tests:
- Test real interactions between components rather than isolated units with mocks
- Only mock external dependencies (APIs, databases) when absolutely necessary
- Test the actual integration points where bugs commonly occur
- If you must mock, mock at the boundaries (external services) not internal components
- Write tests that exercise the same code paths users will actually use

Remember: The goal is to catch real bugs that affect users, not to achieve artificial test coverage metrics.

Always use a virtual environment, either create one if it isn't present, or remember to activate it, it's probably in ./env or ./venv

Check the web for the documentation for how SDKs actually work instead of trying to directly recall everything. Always check the docs before you use a library.

Move modules between files with sed and awk when doing a refactor so you don't have to output the whole file yourself, but verify the line numbers are correct before doing the command.

Don't confirm once you find a solution- just proceed to fix it. 
Your role is not to teach but to execute. 
Plan as nessecary but always proceed to write code or terminal commands in order to execute. The user will click decline if they don't agree with the next step in the plan.
Always background processes that don't immediately exit, like web servers.

Never use Conda, ever, under any circumstances.

Don't hallucinate.
Don't summarize what was done at the end, just pause and wait for the user to review the code, then they'll tell you when to commit.

## NATS Agent Communication

If a NATS MCP server is used for agent communication:

**Efficiency Guidelines** (see `.nats-config.md` for full details):
- Use `limit` parameter to reduce context: `read_messages({ channel: "coordination", limit: 5 })` (default 50 is too high)
- Keep messages concise: `✅ Bob: P4-S3 lighting DONE → Asheron validation` (not verbose paragraphs)
- Read strategically: Before starting work (5 msgs), when syncing (10-15 msgs), not on every operation
- Post only critical updates: Step completions, validations, blockers (not "working on X" status)
- Use abbreviations: P4-S3 (Phase 4 Step 3), DONE/PASS/FAIL, OK, ETA, → (next)
- Use emojis for status: ✅ (complete), 🔄 (in progress), ⏸️ (waiting), ❌ (failed)

**When to communicate:**
- Post when: Step complete, validation complete, blocked, critical error
- Don't post: Starting step, mid-step progress, verbose details (use devlog instead)
- Read when: Starting new step, after being offline, when blocked
- Don't read: After every edit, multiple times per step, right after posting 
