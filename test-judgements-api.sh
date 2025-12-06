#!/bin/bash

# Test script for Judgements API with Elasticsearch features
# Replace YOUR_NGROK_URL with your actual ngrok URL

NGROK_URL="YOUR_NGROK_URL"  # Replace with your ngrok URL, e.g., https://abc123.ngrok.io

echo "=========================================="
echo "Testing Judgements API with Elasticsearch"
echo "=========================================="
echo ""

# Test 1: Basic query with no filters (PostgreSQL)
echo "Test 1: Basic query (no filters) - PostgreSQL"
echo "--------------------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?limit=5" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 2: Full-text search with highlights
echo "Test 2: Full-text search with highlights"
echo "----------------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?search=contract&limit=5&highlight=true" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 3: Court name filter (Elasticsearch)
echo "Test 3: Court name filter"
echo "-------------------------"
curl -X GET "${NGROK_URL}/api/judgements?court_name=Bombay&limit=5" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 4: Judge filter with highlights
echo "Test 4: Judge filter with highlights"
echo "------------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?judge=kathawalla&limit=5&highlight=true" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 5: Title filter
echo "Test 5: Title filter"
echo "--------------------"
curl -X GET "${NGROK_URL}/api/judgements?title=breach&limit=5" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 6: Combined filters (search + court)
echo "Test 6: Combined filters (search + court)"
echo "-----------------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?search=contract&court_name=Bombay&limit=5&highlight=true" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 7: Date range filter
echo "Test 7: Date range filter"
echo "-------------------------"
curl -X GET "${NGROK_URL}/api/judgements?decision_date_from=2020-01-01&decision_date_to=2023-12-31&limit=5" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 8: Year filter
echo "Test 8: Year filter"
echo "-------------------"
curl -X GET "${NGROK_URL}/api/judgements?year=2022&limit=5" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 9: CNR exact match
echo "Test 9: CNR exact match"
echo "-----------------------"
curl -X GET "${NGROK_URL}/api/judgements?cnr=YOUR_CNR_NUMBER&limit=5" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 10: Disposal nature filter
echo "Test 10: Disposal nature filter"
echo "--------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?disposal_nature=Allowed&limit=5" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 11: Include total count
echo "Test 11: Include total count"
echo "---------------------------"
curl -X GET "${NGROK_URL}/api/judgements?search=contract&limit=5&include_total_count=true" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 12: Cursor-based pagination
echo "Test 12: Cursor-based pagination"
echo "--------------------------------"
# First request
RESPONSE=$(curl -s -X GET "${NGROK_URL}/api/judgements?limit=5" \
  -H "Content-Type: application/json")

echo "First page:"
echo "$RESPONSE" | jq '.data | length, .next_cursor'

# Extract cursor for next page
CURSOR_DATE=$(echo "$RESPONSE" | jq -r '.next_cursor.decision_date // empty')
CURSOR_ID=$(echo "$RESPONSE" | jq -r '.next_cursor.id // empty')

if [ ! -z "$CURSOR_DATE" ] && [ ! -z "$CURSOR_ID" ]; then
  echo ""
  echo "Second page (using cursor):"
  curl -X GET "${NGROK_URL}/api/judgements?limit=5&cursor_decision_date=${CURSOR_DATE}&cursor_id=${CURSOR_ID}" \
    -H "Content-Type: application/json" \
    | jq '.data | length, .next_cursor'
fi
echo ""
echo ""

# Test 13: Complex query with all features
echo "Test 13: Complex query (search + filters + highlights + total count)"
echo "---------------------------------------------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?search=contract&court_name=Bombay&year=2022&limit=5&highlight=true&include_total_count=true" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

echo "=========================================="
echo "All tests completed!"
echo "=========================================="

