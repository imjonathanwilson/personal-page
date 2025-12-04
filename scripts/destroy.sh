#!/bin/bash
set -e

echo "================================================"
echo "WARNING: This will destroy all infrastructure!"
echo "================================================"

read -p "Are you sure you want to destroy everything? (type 'yes' to confirm): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Destruction cancelled."
    exit 0
fi

cd "$(dirname "$0")/../terraform"

echo ""
echo "Destroying infrastructure..."
terraform destroy

echo ""
echo "Infrastructure destroyed successfully."
echo ""
echo "Note: The S3 bucket for state storage is NOT destroyed."
echo "To remove it manually, run:"
echo "  aws s3 rb s3://jonathan-wilson-terraform-state --force"
