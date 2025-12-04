#!/bin/bash
set -e

echo "================================================"
echo "Configuring Web Server with Ansible"
echo "================================================"

cd "$(dirname "$0")/.."
source .venv/bin/activate
cd ansible

# Check if inventory file exists
if [ ! -f inventory/hosts ]; then
    echo "ERROR: Inventory file not found."
    echo "Please run terraform apply first to generate the inventory."
    exit 1
fi

echo "Waiting for SSM agent to be ready (60 seconds)..."
sleep 60

echo ""
echo "Testing SSM connectivity..."
ansible webservers -m ping -i inventory/hosts || {
    echo "WARNING: SSM connection failed. Waiting another 30 seconds..."
    sleep 30
    ansible webservers -m ping -i inventory/hosts
}

echo ""
echo "Running Ansible playbook..."
ansible-playbook -i inventory/hosts playbook.yml

echo ""
echo "================================================"
echo "Server configuration complete!"
echo "================================================"

# Get the website URLs from Terraform output
cd ../terraform
CLOUDFRONT_URL=$(terraform output -raw cloudfront_url 2>/dev/null || echo "")
WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")

echo ""
echo "================================================"
echo "Your website is now live!"
echo "================================================"
echo ""

if [ -n "$CLOUDFRONT_URL" ]; then
    echo "🌍 RECOMMENDED - CloudFront (with HTTPS):"
    echo "   $CLOUDFRONT_URL"
    echo ""
    echo "   Note: CloudFront may take 5-15 minutes to fully deploy."
    echo "         If you get errors, wait a few minutes and try again."
    echo ""
fi

if [ -n "$WEBSITE_URL" ]; then
    echo "🔗 Direct access (HTTP only):"
    echo "   $WEBSITE_URL"
    echo ""
fi

echo "Visit Jonathan Wilson's totally RADICAL 90s homepage! 🎉"
