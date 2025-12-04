#!/bin/bash
set -e

echo "================================================"
echo "Invalidating CloudFront Cache"
echo "================================================"

cd "$(dirname "$0")/../terraform"

# Get CloudFront distribution ID
DISTRIBUTION_ID=$(terraform output -raw cloudfront_id 2>/dev/null || echo "")

if [ -z "$DISTRIBUTION_ID" ]; then
    echo "ERROR: Could not get CloudFront distribution ID"
    echo "Make sure Terraform has been applied successfully"
    exit 1
fi

echo "Distribution ID: $DISTRIBUTION_ID"
echo ""
echo "Creating invalidation for all paths (/*) ..."

# Create invalidation
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo ""
echo "✓ Invalidation created: $INVALIDATION_ID"
echo ""
echo "This typically takes 1-2 minutes to complete."
echo ""
echo "Check status with:"
echo "  aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID"
