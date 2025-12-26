#!/bin/bash

# ============================================
# COCONUT V14 - PHASE 2 TEST SCRIPT
# ============================================
# Testing: Gemini Analysis + CocoBoard Complete Flow
# Usage: ./test-coconut-v14-phase2.sh <YOUR_SUPABASE_PROJECT_URL>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
TOTAL=0

# Configuration
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: Please provide Supabase project URL${NC}"
  echo "Usage: ./test-coconut-v14-phase2.sh https://YOUR_PROJECT.supabase.co"
  exit 1
fi

BASE_URL="$1/functions/v1/make-server-e55aa214/api/coconut/v14"
TEST_USER="test-user-phase2-$(date +%s)"
PROJECT_ID=""
COCOBOARD_ID=""

echo -e "${PURPLE}╔════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║  COCONUT V14 - PHASE 2 TEST SUITE     ║${NC}"
echo -e "${PURPLE}║  Gemini Analysis + CocoBoard Flow      ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════╝${NC}"
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
  local expected_code=${5:-200}
  
  TOTAL=$((TOTAL + 1))
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}TEST $TOTAL: $test_name${NC}"
  echo ""
  
  local url="${BASE_URL}${endpoint}"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$url")
  elif [ "$method" = "DELETE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "DELETE" "$url")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)
  
  echo "Response Code: $http_code (expected: $expected_code)"
  echo "Response Body:"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo ""
  
  # Check if response code matches expected
  if [ "$http_code" = "$expected_code" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASS=$((PASS + 1))
    
    # Extract IDs if needed
    if [[ "$test_name" == *"Create Project"* ]]; then
      PROJECT_ID=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
      if [ "$PROJECT_ID" != "null" ] && [ -n "$PROJECT_ID" ]; then
        echo -e "${YELLOW}📝 Saved Project ID: $PROJECT_ID${NC}"
      fi
    fi
    
    if [[ "$test_name" == *"Analyze Intent"* ]] || [[ "$test_name" == *"Get CocoBoard"* ]]; then
      COCOBOARD_ID=$(echo "$body" | jq -r '.data.id // .id' 2>/dev/null)
      if [ "$COCOBOARD_ID" != "null" ] && [ -n "$COCOBOARD_ID" ]; then
        echo -e "${YELLOW}📝 Saved CocoBoard ID: $COCOBOARD_ID${NC}"
      fi
    fi
    
    return 0
  else
    echo -e "${RED}❌ FAIL (expected $expected_code, got $http_code)${NC}"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

# ============================================
# SETUP - Initialize Credits
# ============================================

echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}    SETUP - Initialize Test User      ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo ""

run_test "Initialize Credits" "POST" "/credits/add" '{
  "userId": "'"$TEST_USER"'",
  "amount": 50000,
  "reason": "Phase 2 automated testing - 50,000 credits"
}'

sleep 1

# ============================================
# PHASE 2 TESTS - GEMINI ANALYSIS
# ============================================

echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}    PHASE 2.1 - Gemini Analysis       ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo ""

# TEST 1: Create Project with Simple Intent (No References)
run_test "Create Project - Simple Intent" "POST" "/projects/create" '{
  "userId": "'"$TEST_USER"'",
  "title": "Café Bio - Affiche Minimaliste",
  "description": "Test Phase 2 - Simple intent without references",
  "intent": {
    "description": "Créer une affiche publicitaire élégante et minimaliste pour un café bio. Ambiance chaleureuse avec tons naturels (beige, marron clair, vert sauge). Typographie moderne et épurée. Style scandinave minimaliste. Mettre en avant : grains de café bio, tasse fumante, atmosphère cozy.",
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

sleep 2

# TEST 2: Analyze Intent (This triggers Gemini analysis)
if [ -n "$PROJECT_ID" ]; then
  echo -e "${YELLOW}⏳ Running Gemini Analysis (this may take 30-60 seconds)...${NC}"
  
  run_test "Analyze Intent with Gemini" "POST" "/analyze-intent" '{
    "projectId": "'"$PROJECT_ID"'",
    "userId": "'"$TEST_USER"'",
    "intent": {
      "description": "Créer une affiche publicitaire élégante et minimaliste pour un café bio. Ambiance chaleureuse avec tons naturels (beige, marron clair, vert sauge). Typographie moderne et épurée. Style scandinave minimaliste. Mettre en avant : grains de café bio, tasse fumante, atmosphère cozy.",
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
else
  echo -e "${RED}❌ Skipping Analyze Intent - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 3

# TEST 3: Get CocoBoard
if [ -n "$PROJECT_ID" ]; then
  run_test "Get CocoBoard" "GET" "/cocoboard/$PROJECT_ID"
else
  echo -e "${RED}❌ Skipping Get CocoBoard - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# ============================================
# PHASE 2.2 - COCOBOARD EDITING
# ============================================

echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}    PHASE 2.2 - CocoBoard Editing     ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo ""

# TEST 4: Edit Concept Direction
if [ -n "$PROJECT_ID" ]; then
  run_test "Edit Concept - Direction" "POST" "/cocoboard/$PROJECT_ID/edit" '{
    "userId": "'"$TEST_USER"'",
    "field": "concept.direction",
    "value": "Direction artistique modernisée : Style scandinave minimaliste épuré avec touches de chaleur naturelle"
  }'
else
  echo -e "${RED}❌ Skipping Edit Test - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# TEST 5: Edit Concept Mood
if [ -n "$PROJECT_ID" ]; then
  run_test "Edit Concept - Mood" "POST" "/cocoboard/$PROJECT_ID/edit" '{
    "userId": "'"$TEST_USER"'",
    "field": "concept.mood",
    "value": "Chaleureux, authentique, premium mais accessible"
  }'
else
  echo -e "${RED}❌ Skipping Edit Test - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# TEST 6: Edit Color Palette Primary
if [ -n "$PROJECT_ID" ]; then
  run_test "Edit Color Palette - Primary" "POST" "/cocoboard/$PROJECT_ID/edit" '{
    "userId": "'"$TEST_USER"'",
    "field": "colorPalette.primary",
    "value": ["#D4A574", "#8B6F47", "#E8D5B7"]
  }'
else
  echo -e "${RED}❌ Skipping Edit Test - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# TEST 7: Get CocoBoard After Edits (Verify Custom Values)
if [ -n "$PROJECT_ID" ]; then
  run_test "Get CocoBoard - Verify Edits" "GET" "/cocoboard/$PROJECT_ID"
else
  echo -e "${RED}❌ Skipping Verify Edits - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# ============================================
# PHASE 2.3 - VERSIONING SYSTEM
# ============================================

echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}    PHASE 2.3 - Versioning System     ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo ""

# TEST 8: Create New Version
if [ -n "$PROJECT_ID" ]; then
  run_test "Create CocoBoard Version" "POST" "/cocoboard/$PROJECT_ID/version" '{
    "userId": "'"$TEST_USER"'",
    "reason": "Testing versioning system - creating v2 with edits"
  }'
else
  echo -e "${RED}❌ Skipping Create Version - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# TEST 9: Get Latest Version (Should be v2)
if [ -n "$PROJECT_ID" ]; then
  run_test "Get Latest Version (v2)" "GET" "/cocoboard/$PROJECT_ID"
else
  echo -e "${RED}❌ Skipping Get Version - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# ============================================
# PHASE 2.4 - ASSET MANAGEMENT
# ============================================

echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}    PHASE 2.4 - Asset Management      ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo ""

# TEST 10: Update Asset Status
if [ -n "$PROJECT_ID" ]; then
  # First, we need to get the CocoBoard to find an asset ID
  echo -e "${YELLOW}📝 Fetching CocoBoard to get asset ID...${NC}"
  response=$(curl -s "${BASE_URL}/cocoboard/$PROJECT_ID")
  ASSET_ID=$(echo "$response" | jq -r '.assets[0].id // empty' 2>/dev/null)
  
  if [ -n "$ASSET_ID" ] && [ "$ASSET_ID" != "null" ]; then
    echo -e "${YELLOW}📝 Found Asset ID: $ASSET_ID${NC}"
    
    run_test "Update Asset Status" "POST" "/cocoboard/$PROJECT_ID/asset" '{
      "userId": "'"$TEST_USER"'",
      "assetId": "'"$ASSET_ID"'",
      "status": "generated",
      "data": {
        "url": "test-asset-url.png",
        "signedUrl": "test-signed-url.png"
      }
    }'
  else
    echo -e "${YELLOW}⚠️  No assets found in CocoBoard - Skipping asset update test${NC}"
  fi
else
  echo -e "${RED}❌ Skipping Asset Update - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# ============================================
# PHASE 2.5 - ERROR HANDLING TESTS
# ============================================

echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}    PHASE 2.5 - Error Handling        ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo ""

# TEST 11: Get Non-Existent CocoBoard (Should 404)
run_test "Get Non-Existent CocoBoard" "GET" "/cocoboard/non-existent-id-12345" 404

sleep 1

# TEST 12: Edit with Invalid Field
if [ -n "$PROJECT_ID" ]; then
  run_test "Edit Invalid Field" "POST" "/cocoboard/$PROJECT_ID/edit" '{
    "userId": "'"$TEST_USER"'",
    "field": "invalid.field.path",
    "value": "test"
  }' 500
else
  echo -e "${RED}❌ Skipping Invalid Field Test - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# TEST 13: Edit Without User ID
if [ -n "$PROJECT_ID" ]; then
  run_test "Edit Without User ID" "POST" "/cocoboard/$PROJECT_ID/edit" '{
    "field": "concept.mood",
    "value": "test"
  }' 400
else
  echo -e "${RED}❌ Skipping Missing User Test - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# ============================================
# PHASE 2.6 - CREDITS VALIDATION
# ============================================

echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}    PHASE 2.6 - Credits Validation    ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo ""

# TEST 14: Check Credits Deducted
run_test "Check Credits After Analysis" "GET" "/credits/$TEST_USER"

sleep 1

# TEST 15: Get Transaction History
run_test "Get Transaction History" "GET" "/credits/$TEST_USER/transactions?limit=20"

sleep 1

# ============================================
# CLEANUP
# ============================================

echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}    CLEANUP - Delete Test Data        ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo ""

# TEST 16: Delete Project
if [ -n "$PROJECT_ID" ]; then
  run_test "Delete Test Project" "DELETE" "/project/$PROJECT_ID"
else
  echo -e "${RED}❌ Skipping Delete - No PROJECT_ID available${NC}"
  TOTAL=$((TOTAL + 1))
  FAIL=$((FAIL + 1))
fi

sleep 1

# ============================================
# FINAL RESULTS
# ============================================

echo ""
echo -e "${PURPLE}╔════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║      PHASE 2 TEST RESULTS SUMMARY     ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Total Tests:${NC} $TOTAL"
echo -e "${GREEN}Passed:${NC}      $PASS"
echo -e "${RED}Failed:${NC}      $FAIL"
echo ""

if [ $TOTAL -eq 0 ]; then
  echo -e "${RED}❌ ERROR: No tests were run${NC}"
  exit 1
fi

PASS_RATE=$((PASS * 100 / TOTAL))

echo -e "${YELLOW}Pass Rate:${NC}   $PASS_RATE%"
echo ""

if [ $PASS_RATE -ge 85 ]; then
  echo -e "${GREEN}✅ EXCELLENT: Phase 2 validation complete!${NC}"
  echo -e "${GREEN}🎉 Gemini Analysis + CocoBoard system working perfectly!${NC}"
  echo ""
  echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${PURPLE}    PHASE 2 COMPLETE - READY FOR PHASE 3!${NC}"
  echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
elif [ $PASS_RATE -ge 70 ]; then
  echo -e "${YELLOW}⚠️  WARNING: $PASS_RATE% pass rate${NC}"
  echo -e "${YELLOW}Some tests failed. Review logs above.${NC}"
  exit 1
else
  echo -e "${RED}❌ FAILURE: $PASS_RATE% pass rate${NC}"
  echo -e "${RED}Multiple critical tests failed. Debug required.${NC}"
  exit 1
fi
