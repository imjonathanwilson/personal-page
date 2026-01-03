#!/bin/bash
# Lighthouse Performance Audit for Production
# Requires: npm install -g lighthouse

PROD_URL="https://d1ckpmp50t9j5g.cloudfront.net"
OUTPUT_DIR="/home/jdubz/personal-page/.screenshots/lighthouse"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$OUTPUT_DIR"

echo "=== Running Lighthouse Audit ==="
echo "URL: $PROD_URL"
echo "Output: $OUTPUT_DIR"
echo ""

# Desktop audit
echo "Running desktop audit..."
lighthouse "$PROD_URL" \
    --output=html \
    --output=json \
    --output-path="$OUTPUT_DIR/desktop-$TIMESTAMP" \
    --chrome-flags="--headless" \
    --preset=desktop \
    --only-categories=performance,accessibility,best-practices,seo

# Mobile audit
echo "Running mobile audit..."
lighthouse "$PROD_URL" \
    --output=html \
    --output=json \
    --output-path="$OUTPUT_DIR/mobile-$TIMESTAMP" \
    --chrome-flags="--headless" \
    --preset=mobile \
    --only-categories=performance,accessibility,best-practices,seo

echo ""
echo "=== Audit Complete ==="
echo "Results saved to: $OUTPUT_DIR"
echo ""

# Extract scores from JSON
if [ -f "$OUTPUT_DIR/desktop-$TIMESTAMP.report.json" ]; then
    echo "Desktop Scores:"
    cat "$OUTPUT_DIR/desktop-$TIMESTAMP.report.json" | grep -o '"performance":[0-9.]*' | head -1
    cat "$OUTPUT_DIR/desktop-$TIMESTAMP.report.json" | grep -o '"accessibility":[0-9.]*' | head -1
    cat "$OUTPUT_DIR/desktop-$TIMESTAMP.report.json" | grep -o '"best-practices":[0-9.]*' | head -1
    cat "$OUTPUT_DIR/desktop-$TIMESTAMP.report.json" | grep -o '"seo":[0-9.]*' | head -1
fi

echo ""

if [ -f "$OUTPUT_DIR/mobile-$TIMESTAMP.report.json" ]; then
    echo "Mobile Scores:"
    cat "$OUTPUT_DIR/mobile-$TIMESTAMP.report.json" | grep -o '"performance":[0-9.]*' | head -1
    cat "$OUTPUT_DIR/mobile-$TIMESTAMP.report.json" | grep -o '"accessibility":[0-9.]*' | head -1
    cat "$OUTPUT_DIR/mobile-$TIMESTAMP.report.json" | grep -o '"best-practices":[0-9.]*' | head -1
    cat "$OUTPUT_DIR/mobile-$TIMESTAMP.report.json" | grep -o '"seo":[0-9.]*' | head -1
fi
