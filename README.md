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
- Security Group (HTTP/HTTPS only)
- EC2 Instance (Graviton t4g.small)
- Elastic IP
- CloudFront distribution
- S3 bucket for Terraform state
- AWS Systems Manager for secure access

## Prerequisites

1. **AWS CLI** configured with credentials
2. **Terraform** installed (>= 1.0)
3. **Ansible** installed with SSM support
4. **AWS Session Manager Plugin** installed

## Deployment Steps

### Step 1: Setup Backend (S3)

This creates the S3 bucket for Terraform state management:

```bash
cd jonathan-wilson-infra
./scripts/01-setup-backend.sh
```

### Step 2: Deploy Infrastructure

Deploy the EC2 instance and networking:

```bash
./scripts/02-deploy-infrastructure.sh
```

### Step 3: Configure Web Server

Configure Nginx and deploy the website:

```bash
./scripts/03-configure-server.sh
```

### Step 4: Access Your Website

After deployment, access via:

**CloudFront (HTTPS):**
```
https://<CLOUDFRONT_DOMAIN>.cloudfront.net
```

**Direct (HTTP):**
```
http://<ELASTIC_IP>
```

CloudFront takes 5-15 minutes to deploy.

## Manual Deployment

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

1. Edit `website/jonathan-wilson-90s.html`
2. Run:
   ```bash
   cd ansible
   ansible-playbook -i inventory/hosts playbook.yml
   ```

## Terraform Outputs

View outputs:

```bash
cd terraform
terraform output
```

Available outputs include:
- `cloudfront_url` - CloudFront HTTPS URL
- `web_server_public_ip` - Public IP of the server

## State Management

- State stored in S3 bucket
- Encrypted at rest
- Versioned for history

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

## Teardown

Destroy infrastructure:

```bash
./scripts/destroy.sh
```

To remove the state backend:

```bash
aws s3 rb s3://jonathan-wilson-terraform-state --force
```

## GitHub Actions Secrets

Set these repository secrets for GitHub Actions deployment:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DOMAIN_NAME` (optional)
- `ACM_CERTIFICATE_ARN` (required if DOMAIN_NAME is set)

## Cost Estimate

Monthly costs (approximate):
- t4g.small EC2: ~$15/month
- CloudFront: ~$1-2/month
- Elastic IP: Free
- S3 state storage: < $0.10/month

**Total: ~$16-17/month**

## Security Features

- No SSH required - Uses AWS Systems Manager
- Only HTTP/HTTPS ports exposed
- HTTPS via CloudFront
- DDoS protection
- Encrypted storage

## Troubleshooting

CloudFront takes 5-15 minutes to deploy. Check status:

```bash
cd terraform
aws cloudfront get-distribution --id $(terraform output -raw cloudfront_id) --query 'Distribution.Status'
```

Wait until status is `Deployed`.

To invalidate CloudFront cache:

```bash
cd terraform
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_id) \
  --paths "/*"
```


## Project Structure

```
jonathan-wilson-infra/
├── terraform/           # Infrastructure as code
├── ansible/             # Server configuration
├── website/             # HTML files
└── scripts/             # Deployment scripts
```

## Support

Check:
- Terraform logs: `terraform.log`
- AWS Console: EC2, VPC, S3
