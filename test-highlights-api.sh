#!/bin/bash

# Test script for Judgements API Highlights (Title, Judge, CNR)
# Replace YOUR_NGROK_URL with your actual ngrok URL

NGROK_URL="YOUR_NGROK_URL"  # Replace with your ngrok URL, e.g., https://abc123.ngrok.io

echo "=========================================="
echo "Testing Judgements API Highlights"
echo "=========================================="
echo ""

# Test 1: Title filter with highlights
echo "Test 1: Title filter with highlights"
echo "-------------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?title=contract&limit=3&highlight=true" \
  -H "Content-Type: application/json" \
  | jq '.data[0] | {id, title, judge, cnr, highlights}'
echo ""
echo ""

# Test 2: Judge filter with highlights
echo "Test 2: Judge filter with highlights"
echo "-------------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?judge=kathawalla&limit=3&highlight=true" \
  -H "Content-Type: application/json" \
  | jq '.data[0] | {id, title, judge, cnr, highlights}'
echo ""
echo ""

# Test 3: CNR filter with highlights
echo "Test 3: CNR filter with highlights"
echo "----------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?cnr=YOUR_CNR&limit=3&highlight=true" \
  -H "Content-Type: application/json" \
  | jq '.data[0] | {id, title, judge, cnr, highlights}'
echo ""
echo ""

# Test 4: Combined filters (title + judge) with highlights
echo "Test 4: Combined filters (title + judge) with highlights"
echo "--------------------------------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?title=breach&judge=kathawalla&limit=3&highlight=true" \
  -H "Content-Type: application/json" \
  | jq '.data[0] | {id, title, judge, cnr, highlights}'
echo ""
echo ""

# Test 5: Full-text search with highlights (should highlight all fields)
echo "Test 5: Full-text search with highlights"
echo "-----------------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?search=contract&limit=3&highlight=true" \
  -H "Content-Type: application/json" \
  | jq '.data[0] | {id, title, judge, cnr, highlights}'
echo ""
echo ""

# Test 6: Check highlight structure
echo "Test 6: Full highlight structure check"
echo "--------------------------------------"
curl -X GET "${NGROK_URL}/api/judgements?judge=kathawalla&limit=1&highlight=true" \
  -H "Content-Type: application/json" \
  | jq '.data[0].highlights'
echo ""
echo ""

echo "=========================================="
echo "Highlight Tests Completed!"
echo "=========================================="
echo ""
echo "Expected highlight structure:"
echo "  highlights: {"
echo "    title: [\"highlighted title text\"],"
echo "    judge: [\"highlighted judge name\"],  # Should be added to backend"
echo "    cnr: [\"highlighted CNR\"],          # Should be added to backend"
echo "    pdf_text: [\"highlighted pdf snippets\"]"
echo "  }"

