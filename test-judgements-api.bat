@echo off
REM Test script for Judgements API with Elasticsearch features (Windows)
REM Replace YOUR_NGROK_URL with your actual ngrok URL

set NGROK_URL=YOUR_NGROK_URL
REM Example: set NGROK_URL=https://abc123.ngrok.io

echo ==========================================
echo Testing Judgements API with Elasticsearch
echo ==========================================
echo.

REM Test 1: Basic query with no filters (PostgreSQL)
echo Test 1: Basic query (no filters) - PostgreSQL
echo --------------------------------------------
curl -X GET "%NGROK_URL%/api/judgements?limit=5" -H "Content-Type: application/json"
echo.
echo.

REM Test 2: Full-text search with highlights
echo Test 2: Full-text search with highlights
echo ------------------------------------------
curl -X GET "%NGROK_URL%/api/judgements?search=contract&limit=5&highlight=true" -H "Content-Type: application/json"
echo.
echo.

REM Test 3: Court name filter (Elasticsearch)
echo Test 3: Court name filter
echo -------------------------
curl -X GET "%NGROK_URL%/api/judgements?court_name=Bombay&limit=5" -H "Content-Type: application/json"
echo.
echo.

REM Test 4: Judge filter with highlights
echo Test 4: Judge filter with highlights
echo -------------------------------------
curl -X GET "%NGROK_URL%/api/judgements?judge=kathawalla&limit=5&highlight=true" -H "Content-Type: application/json"
echo.
echo.

REM Test 5: Title filter
echo Test 5: Title filter
echo --------------------
curl -X GET "%NGROK_URL%/api/judgements?title=breach&limit=5" -H "Content-Type: application/json"
echo.
echo.

REM Test 6: Combined filters (search + court)
echo Test 6: Combined filters (search + court)
echo -----------------------------------------
curl -X GET "%NGROK_URL%/api/judgements?search=contract&court_name=Bombay&limit=5&highlight=true" -H "Content-Type: application/json"
echo.
echo.

REM Test 7: Date range filter
echo Test 7: Date range filter
echo --------------------------
curl -X GET "%NGROK_URL%/api/judgements?decision_date_from=2020-01-01&decision_date_to=2023-12-31&limit=5" -H "Content-Type: application/json"
echo.
echo.

REM Test 8: Year filter
echo Test 8: Year filter
echo --------------------
curl -X GET "%NGROK_URL%/api/judgements?year=2022&limit=5" -H "Content-Type: application/json"
echo.
echo.

REM Test 9: Disposal nature filter
echo Test 9: Disposal nature filter
echo --------------------------------
curl -X GET "%NGROK_URL%/api/judgements?disposal_nature=Allowed&limit=5" -H "Content-Type: application/json"
echo.
echo.

REM Test 10: Include total count
echo Test 10: Include total count
echo -----------------------------
curl -X GET "%NGROK_URL%/api/judgements?search=contract&limit=5&include_total_count=true" -H "Content-Type: application/json"
echo.
echo.

REM Test 11: Complex query with all features
echo Test 11: Complex query (search + filters + highlights + total count)
echo ---------------------------------------------------------------------
curl -X GET "%NGROK_URL%/api/judgements?search=contract&court_name=Bombay&year=2022&limit=5&highlight=true&include_total_count=true" -H "Content-Type: application/json"
echo.
echo.

echo ==========================================
echo All tests completed!
echo ==========================================
pause

