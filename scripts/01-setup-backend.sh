#!/bin/bash
set -e

echo "================================================"
echo "Setting up S3 Backend"
echo "================================================"

cd "$(dirname "$0")/../terraform-backend"

# Check if backend resources already exist
if aws s3 ls s3://jonathan-wilson-terraform-state 2>/dev/null; then
    echo "✓ S3 bucket already exists"
else
    echo "Creating S3 bucket..."

    # Initialize and apply backend setup
    terraform init
    terraform apply -auto-approve

    echo "✓ S3 bucket created successfully"
fi

echo ""
echo "Backend setup complete!"
echo "You can now run the main infrastructure deployment."
