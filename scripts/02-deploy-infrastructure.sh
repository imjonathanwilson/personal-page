#!/bin/bash
set -e

echo "================================================"
echo "Deploying Infrastructure with Terraform"
echo "================================================"

cd "$(dirname "$0")/../terraform"

echo "Initializing Terraform..."
terraform init

echo ""
echo "Planning infrastructure changes..."
terraform plan -out=tfplan

echo ""
read -p "Do you want to apply these changes? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "Applying infrastructure changes..."
terraform apply tfplan

echo ""
echo "================================================"
echo "Infrastructure deployed successfully!"
echo "================================================"

# Display outputs
terraform output

echo ""
echo "Next step: Run the Ansible configuration"
echo "  ./scripts/03-configure-server.sh"
