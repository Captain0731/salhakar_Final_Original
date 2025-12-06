@echo off
REM Test script for Judgements API Highlights (Title, Judge, CNR) - Windows
REM Replace YOUR_NGROK_URL with your actual ngrok URL

set NGROK_URL=YOUR_NGROK_URL
REM Example: set NGROK_URL=https://abc123.ngrok.io

echo ==========================================
echo Testing Judgements API Highlights
echo ==========================================
echo.

REM Test 1: Title filter with highlights
echo Test 1: Title filter with highlights
echo -------------------------------------
curl -X GET "%NGROK_URL%/api/judgements?title=contract&limit=3&highlight=true" -H "Content-Type: application/json"
echo.
echo.

REM Test 2: Judge filter with highlights
echo Test 2: Judge filter with highlights
echo -------------------------------------
curl -X GET "%NGROK_URL%/api/judgements?judge=kathawalla&limit=3&highlight=true" -H "Content-Type: application/json"
echo.
echo.

REM Test 3: CNR filter with highlights
echo Test 3: CNR filter with highlights
echo ----------------------------------
curl -X GET "%NGROK_URL%/api/judgements?cnr=YOUR_CNR&limit=3&highlight=true" -H "Content-Type: application/json"
echo.
echo.

REM Test 4: Combined filters with highlights
echo Test 4: Combined filters (title + judge) with highlights
echo --------------------------------------------------------
curl -X GET "%NGROK_URL%/api/judgements?title=breach&judge=kathawalla&limit=3&highlight=true" -H "Content-Type: application/json"
echo.
echo.

REM Test 5: Full-text search with highlights
echo Test 5: Full-text search with highlights
echo -----------------------------------------
curl -X GET "%NGROK_URL%/api/judgements?search=contract&limit=3&highlight=true" -H "Content-Type: application/json"
echo.
echo.

echo ==========================================
echo Highlight Tests Completed!
echo ==========================================
pause

