# Jonathan Wilson 90s Website Infrastructure

This project deploys a classic 90s-style website for Jonathan Wilson on AWS infrastructure using Terraform and Ansible.

## Architecture

- **EC2**: t4g.small instance (Graviton ARM64 - latest generation)
- **OS**: Amazon Linux 2023 ARM64
- **Web Server**: Nginx
- **CDN**: CloudFront with free SSL/TLS
- **State Management**: S3 backend with versioning
- **Configuration Management**: Ansible

## Infrastructure Components

- VPC with public subnet
- Internet Gateway
- Security Group (HTTP/HTTPS only - no SSH!)
- EC2 Instance (Graviton t4g.small) with IAM role for SSM
- Elastic IP
- CloudFront distribution (global CDN with free SSL)
- S3 bucket for Terraform state (encrypted, versioned)
- **AWS Systems Manager** for secure instance access (no SSH keys needed!)

## Prerequisites

1. **AWS CLI** configured with credentials:
   ```bash
   aws configure
   ```

2. **Terraform** installed (>= 1.0):
   ```bash
   # Download from https://www.terraform.io/downloads
   ```

3. **Ansible** installed with SSM support:
   ```bash
   pip install ansible
   pip install ansible-pylibssh
   ```

4. **AWS Session Manager Plugin**:
   - Download and install from: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html
   - This enables Ansible to connect via SSM (no SSH keys needed!)

5. **Custom Domain Configuration (Optional)**:
   - If using a custom domain, you'll need:
     - A domain name registered with any domain registrar
     - An ACM certificate in the `us-east-1` region for your domain
     - The ACM certificate ARN to add as a GitHub secret

## Deployment Steps

### Step 1: Setup Backend (S3)

This creates the S3 bucket for Terraform state management:

```bash
cd jonathan-wilson-infra
./scripts/01-setup-backend.sh
```

### Step 2: Deploy Infrastructure

This deploys the EC2 instance and networking:

```bash
./scripts/02-deploy-infrastructure.sh
```

This will:
- Create VPC, subnet, and networking components
- Launch a t4g.small Graviton EC2 instance
- Assign an Elastic IP
- Generate the Ansible inventory file

### Step 3: Configure Web Server

This configures Nginx and deploys the website:

```bash
./scripts/03-configure-server.sh
```

This will:
- Install and configure Nginx
- Deploy the 90s website HTML
- Start the web server

### Step 4: Access Your Website

After deployment completes, the script will display two URLs:

**Recommended - CloudFront (HTTPS):**
```
https://<CLOUDFRONT_DOMAIN>.cloudfront.net
```

**Direct access (HTTP):**
```
http://<ELASTIC_IP>
```

**Note:** CloudFront deployment takes 5-15 minutes. If you get errors initially, wait and try again.

## Manual Deployment Steps

If you prefer to run commands manually:

### 1. Setup Backend

```bash
cd terraform
terraform init
terraform apply -target=aws_s3_bucket.terraform_state
```

### 2. Deploy Infrastructure

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 3. Configure Server

```bash
cd ansible
ansible-playbook -i inventory/hosts playbook.yml
```

## Updating the Website

To update the website content:

1. Edit `website/jonathan-wilson-90s.html`
2. Run the Ansible playbook again:
   ```bash
   cd ansible
   ansible-playbook -i inventory/hosts playbook.yml
   ```

## Terraform Outputs

After deployment, view outputs:

```bash
cd terraform
terraform output
```

Available outputs:
- `cloudfront_url` - CloudFront HTTPS URL (recommended)
- `cloudfront_domain` - CloudFront domain name
- `web_server_public_ip` - Public IP of the server
- `website_url` - Direct HTTP URL to the website
- `instance_id` - EC2 instance ID
- `ami_id` - AMI ID used

## State Management

- **State File**: Stored in S3 bucket `jonathan-wilson-terraform-state`
- **Encryption**: State file is encrypted at rest (AES256)
- **Versioning**: S3 versioning enabled for state history

## Customization

### Change Instance Size

Edit `terraform/variables.tf`:

```hcl
variable "instance_type" {
  default = "t4g.micro"  # Smaller
  # or
  default = "t4g.medium" # Larger
}
```

### Change Region

Edit `terraform/variables.tf`:

```hcl
variable "aws_region" {
  default = "us-west-2"  # Change region
}
```

### Restrict SSH Access

Edit `terraform/variables.tf`:

```hcl
variable "ssh_cidr_blocks" {
  default = ["YOUR.IP.ADDRESS/32"]  # Your IP only
}
```

## Teardown

To destroy all infrastructure:

```bash
./scripts/destroy.sh
```

This will destroy the EC2 instance and networking, but preserve the S3 bucket for state management.

To completely remove everything including state backend:

```bash
aws s3 rb s3://jonathan-wilson-terraform-state --force
```

## GitHub Actions Secrets

If you're using GitHub Actions for deployment, configure these repository secrets:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key ID
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
   - `DOMAIN_NAME`: Your domain (optional, e.g., `example.com`)
   - `ACM_CERTIFICATE_ARN`: Your certificate ARN (optional, required if DOMAIN_NAME is set)

## Cost Estimate

Monthly costs (approximate):
- t4g.small EC2: ~$15/month
- CloudFront: ~$1-2/month (low traffic)
- Elastic IP: Free (while associated)
- S3 state storage: < $0.10/month
- Data transfer: Minimal

**Total: ~$16-17/month**

## Security Features

- **No SSH keys required** - Uses AWS Systems Manager for secure access
- **No SSH port exposed** - Security group only allows HTTP/HTTPS
- **HTTPS by default** via CloudFront (free SSL/TLS certificate)
- **DDoS protection** via AWS Shield Standard (included with CloudFront)
- **IAM-based access control** via SSM (audited in CloudTrail)
- IMDSv2 required (Instance Metadata Service)
- Encrypted EBS root volume
- Security group with minimal access (no SSH port 22)
- S3 bucket encryption and versioning
- No public bucket access

## Troubleshooting

### CloudFront Not Working

CloudFront takes 5-15 minutes to deploy globally. Check status:

```bash
cd terraform
aws cloudfront get-distribution --id $(terraform output -raw cloudfront_id) --query 'Distribution.Status'
```

Wait until status is `Deployed`.

### SSM Connection Issues

SSM agent takes about 60 seconds to initialize. If Ansible can't connect:

```bash
cd ansible
ansible webservers -m ping -i inventory/hosts
```

Check SSM agent status:
```bash
# Get instance ID from Terraform
INSTANCE_ID=$(cd terraform && terraform output -raw instance_id)

# Check if instance is managed by SSM
aws ssm describe-instance-information \
  --filters "Key=InstanceIds,Values=$INSTANCE_ID"
```

### Website Not Loading

Check security group rules:

```bash
aws ec2 describe-security-groups --group-ids <SECURITY_GROUP_ID>
```

Verify Nginx is running via SSM:

```bash
# Get instance ID
INSTANCE_ID=$(cd terraform && terraform output -raw instance_id)

# Connect via SSM and check Nginx
aws ssm start-session --target $INSTANCE_ID
# Once connected, run:
sudo systemctl status nginx
```

### Invalidating CloudFront Cache

After updating the website, invalidate CloudFront cache:

```bash
cd terraform
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_id) \
  --paths "/*"
```


## Project Structure

```
jonathan-wilson-infra/
├── terraform/
│   ├── main.tf              # Main infrastructure
│   ├── cloudfront.tf        # CloudFront CDN configuration
│   ├── variables.tf         # Variables
│   ├── outputs.tf           # Outputs
│   ├── backend-setup.tf     # S3 backend setup
│   └── templates/
│       └── inventory.tpl    # Ansible inventory template
├── ansible/
│   ├── playbook.yml         # Main playbook
│   ├── ansible.cfg          # Ansible configuration
│   ├── inventory/
│   │   └── hosts            # Generated by Terraform
│   └── templates/
│       └── nginx.conf.j2    # Nginx configuration
├── website/
│   └── jonathan-wilson-90s.html  # The 90s website
└── scripts/
    ├── 01-setup-backend.sh
    ├── 02-deploy-infrastructure.sh
    ├── 03-configure-server.sh
    └── destroy.sh
```

## License

This is a personal project for Jonathan Wilson's 90s-style homepage.

## Support

For issues or questions, please check:
- Terraform logs: `terraform.log`
- Ansible output: verbose mode with `-vvv`
- AWS Console: EC2, VPC, S3 sections
