#!/bin/bash
# Production Smoke Tests for Next.js Deployment
# URL: https://d1ckpmp50t9j5g.cloudfront.net

PROD_URL="https://d1ckpmp50t9j5g.cloudfront.net"
RESULTS_FILE="/home/jdubz/personal-page/smoke-test-results.txt"

echo "=== Production Smoke Tests ===" > "$RESULTS_FILE"
echo "Date: $(date)" >> "$RESULTS_FILE"
echo "URL: $PROD_URL" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Test 1: Homepage loads (HTTP 200)
echo "Test 1: Homepage loads (HTTP 200)" | tee -a "$RESULTS_FILE"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ PASS - HTTP $HTTP_CODE" | tee -a "$RESULTS_FILE"
else
    echo "❌ FAIL - HTTP $HTTP_CODE" | tee -a "$RESULTS_FILE"
fi
echo "" >> "$RESULTS_FILE"

# Test 2: Homepage contains expected Next.js content
echo "Test 2: Next.js content present" | tee -a "$RESULTS_FILE"
CONTENT=$(curl -s "$PROD_URL")
if echo "$CONTENT" | grep -q "next"; then
    echo "✅ PASS - Next.js content detected" | tee -a "$RESULTS_FILE"
else
    echo "❌ FAIL - Next.js content not found" | tee -a "$RESULTS_FILE"
fi
echo "" >> "$RESULTS_FILE"

# Test 3: Check for Three.js script
echo "Test 3: Three.js script present" | tee -a "$RESULTS_FILE"
if echo "$CONTENT" | grep -q "three"; then
    echo "✅ PASS - Three.js reference found" | tee -a "$RESULTS_FILE"
else
    echo "⚠️  WARN - Three.js reference not found (may be bundled)" | tee -a "$RESULTS_FILE"
fi
echo "" >> "$RESULTS_FILE"

# Test 4: Check for terminal/typing animation keywords
echo "Test 4: Terminal/typing content present" | tee -a "$RESULTS_FILE"
if echo "$CONTENT" | grep -qi "terminal\|jonathan\|wilson"; then
    echo "✅ PASS - Terminal content detected" | tee -a "$RESULTS_FILE"
else
    echo "❌ FAIL - Terminal content not found" | tee -a "$RESULTS_FILE"
fi
echo "" >> "$RESULTS_FILE"

# Test 5: Check for footer links
echo "Test 5: Footer links present" | tee -a "$RESULTS_FILE"
if echo "$CONTENT" | grep -qi "github\|linkedin\|email"; then
    echo "✅ PASS - Footer links detected" | tee -a "$RESULTS_FILE"
else
    echo "❌ FAIL - Footer links not found" | tee -a "$RESULTS_FILE"
fi
echo "" >> "$RESULTS_FILE"

# Test 6: Response time check
echo "Test 6: Response time" | tee -a "$RESULTS_FILE"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$PROD_URL")
echo "Response time: ${RESPONSE_TIME}s" | tee -a "$RESULTS_FILE"
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    echo "✅ PASS - Response time under 2s" | tee -a "$RESULTS_FILE"
else
    echo "⚠️  WARN - Response time over 2s" | tee -a "$RESULTS_FILE"
fi
echo "" >> "$RESULTS_FILE"

# Test 7: CloudFront headers
echo "Test 7: CloudFront headers present" | tee -a "$RESULTS_FILE"
HEADERS=$(curl -s -I "$PROD_URL")
if echo "$HEADERS" | grep -q "cloudfront"; then
    echo "✅ PASS - CloudFront headers present" | tee -a "$RESULTS_FILE"
else
    echo "❌ FAIL - CloudFront headers missing" | tee -a "$RESULTS_FILE"
fi
echo "" >> "$RESULTS_FILE"

# Test 8: Content-Type header
echo "Test 8: Content-Type header" | tee -a "$RESULTS_FILE"
CONTENT_TYPE=$(echo "$HEADERS" | grep -i "content-type" | head -1)
echo "$CONTENT_TYPE" | tee -a "$RESULTS_FILE"
if echo "$CONTENT_TYPE" | grep -q "text/html"; then
    echo "✅ PASS - Correct Content-Type" | tee -a "$RESULTS_FILE"
else
    echo "❌ FAIL - Incorrect Content-Type" | tee -a "$RESULTS_FILE"
fi
echo "" >> "$RESULTS_FILE"

# Summary
echo "=== Summary ===" | tee -a "$RESULTS_FILE"
PASS_COUNT=$(grep -c "✅ PASS" "$RESULTS_FILE")
FAIL_COUNT=$(grep -c "❌ FAIL" "$RESULTS_FILE")
WARN_COUNT=$(grep -c "⚠️  WARN" "$RESULTS_FILE")

echo "Passed: $PASS_COUNT" | tee -a "$RESULTS_FILE"
echo "Failed: $FAIL_COUNT" | tee -a "$RESULTS_FILE"
echo "Warnings: $WARN_COUNT" | tee -a "$RESULTS_FILE"

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo "✅ ALL CRITICAL TESTS PASSED" | tee -a "$RESULTS_FILE"
else
    echo "❌ SOME TESTS FAILED" | tee -a "$RESULTS_FILE"
fi

echo "" >> "$RESULTS_FILE"
echo "Full results saved to: $RESULTS_FILE"
