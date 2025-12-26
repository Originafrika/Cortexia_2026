#!/bin/bash

# ============================================
# COCONUT V14 - AUTOMATED TEST SCRIPT
# ============================================
# Phase 1 - Foundation Tests
# Usage: ./test-coconut-v14.sh <YOUR_SUPABASE_PROJECT_URL>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
TOTAL=0

# Configuration
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: Please provide Supabase project URL${NC}"
  echo "Usage: ./test-coconut-v14.sh https://YOUR_PROJECT.supabase.co"
  exit 1
fi

BASE_URL="$1/functions/v1/make-server-e55aa214/api/coconut/v14"
TEST_USER="test-user-coconut-v14-$(date +%s)"
PROJECT_ID=""

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  COCONUT V14 - PHASE 1 TEST SUITE     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Base URL:${NC} $BASE_URL"
echo -e "${YELLOW}Test User:${NC} $TEST_USER"
echo ""

# Helper function to run test
run_test() {
  local test_name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  TOTAL=$((TOTAL + 1))
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}TEST $TOTAL: $test_name${NC}"
  echo ""
  
  local url="${BASE_URL}${endpoint}"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$url")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)
  
  echo "Response Code: $http_code"
  echo "Response Body:"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo ""
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASS=$((PASS + 1))
    
    # Extract project ID if this is create project test
    if [[ "$test_name" == *"Create Project"* ]]; then
      PROJECT_ID=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
      if [ "$PROJECT_ID" != "null" ] && [ -n "$PROJECT_ID" ]; then
        echo -e "${YELLOW}📝 Saved Project ID: $PROJECT_ID${NC}"
      fi
    fi
    
    return 0
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

# ============================================
# RUN TESTS
# ============================================

# TEST 1: Health Check
run_test "Health Check" "GET" "/health"

sleep 1

# TEST 2: Get Credits (Auto-Initialize)
run_test "Get Credits (Auto-Initialize)" "GET" "/credits/$TEST_USER"

sleep 1

# TEST 3: Add Credits
run_test "Add Credits" "POST" "/credits/add" '{
  "userId": "'"$TEST_USER"'",
  "amount": 10000,
  "reason": "Test credits for Phase 1 automated test"
}'

sleep 1

# TEST 4: Create Project
run_test "Create Project" "POST" "/projects/create" '{
  "userId": "'"$TEST_USER"'",
  "title": "Automated Test - Café Bio",
  "description": "Test project created by automated test suite",
  "intent": {
    "description": "Créer une affiche publicitaire élégante et minimaliste pour un café bio. Ambiance chaleureuse, tons naturels, typographie moderne.",
    "references": {
      "images": [],
      "videos": [],
      "descriptions": []
    },
    "format": "3:4",
    "resolution": "1K",
    "targetUsage": "print"
  }
}'

sleep 1

# TEST 5: Get Project
if [ -n "$PROJECT_ID" ]; then
  run_test "Get Project" "GET" "/project/$PROJECT_ID"
else
  echo -e "${RED}❌ Skipping Get Project - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# TEST 6: Get User Projects
run_test "Get User Projects" "GET" "/projects/$TEST_USER"

sleep 1

# TEST 7: Deduct Credits
run_test "Deduct Credits" "POST" "/credits/deduct" '{
  "userId": "'"$TEST_USER"'",
  "amount": 105,
  "reason": "Test deduction - analysis cost",
  "projectId": "'"$PROJECT_ID"'"
}'

sleep 1

# TEST 8: Get Transactions
run_test "Get Transactions" "GET" "/credits/$TEST_USER/transactions?limit=10"

sleep 1

# TEST 9: Get Spending Summary
run_test "Spending Summary" "GET" "/credits/$TEST_USER/summary?days=30"

sleep 1

# TEST 10: Delete Project
if [ -n "$PROJECT_ID" ]; then
  run_test "Delete Project" "DELETE" "/project/$PROJECT_ID"
else
  echo -e "${RED}❌ Skipping Delete Project - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# TEST 11: Verify Project Deleted
if [ -n "$PROJECT_ID" ]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}TEST $((TOTAL + 1)): Verify Project Deleted (Should 404)${NC}"
  echo ""
  
  response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/project/$PROJECT_ID")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)
  
  echo "Response Code: $http_code"
  echo "Response Body:"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo ""
  
  TOTAL=$((TOTAL + 1))
  
  if [ "$http_code" = "404" ]; then
    echo -e "${GREEN}✅ PASS (correctly returned 404)${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ FAIL (expected 404, got $http_code)${NC}"
    FAIL=$((FAIL + 1))
  fi
else
  echo -e "${RED}❌ Skipping Verify Deleted - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# TEST 12: Test Insufficient Credits (Error Case)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}TEST $((TOTAL + 1)): Test Insufficient Credits (Should Fail)${NC}"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/credits/deduct" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'"$TEST_USER"'",
    "amount": 50000,
    "reason": "Should fail - insufficient credits"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

echo "Response Code: $http_code"
echo "Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

TOTAL=$((TOTAL + 1))

# This should fail with 500
if [ "$http_code" = "500" ]; then
  error_msg=$(echo "$body" | jq -r '.message' 2>/dev/null)
  if [[ "$error_msg" == *"Insufficient credits"* ]]; then
    echo -e "${GREEN}✅ PASS (correctly rejected insufficient credits)${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ FAIL (wrong error message)${NC}"
    FAIL=$((FAIL + 1))
  fi
else
  echo -e "${RED}❌ FAIL (expected 500, got $http_code)${NC}"
  FAIL=$((FAIL + 1))
fi

# ============================================
# FINAL RESULTS
# ============================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         TEST RESULTS SUMMARY           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Total Tests:${NC} $TOTAL"
echo -e "${GREEN}Passed:${NC}      $PASS"
echo -e "${RED}Failed:${NC}      $FAIL"
echo ""

PASS_RATE=$((PASS * 100 / TOTAL))

if [ $PASS_RATE -ge 90 ]; then
  echo -e "${GREEN}✅ SUCCESS: $PASS_RATE% pass rate${NC}"
  echo -e "${GREEN}🎉 Phase 1 validation complete!${NC}"
  exit 0
elif [ $PASS_RATE -ge 70 ]; then
  echo -e "${YELLOW}⚠️  WARNING: $PASS_RATE% pass rate${NC}"
  echo -e "${YELLOW}Some tests failed. Review logs above.${NC}"
  exit 1
else
  echo -e "${RED}❌ FAILURE: $PASS_RATE% pass rate${NC}"
  echo -e "${RED}Multiple tests failed. Debug required.${NC}"
  exit 1
fi
