# Elasticsearch Integration for Judgements API

## Overview
The frontend has been updated to support the new Elasticsearch-powered judgements API endpoint with enhanced search capabilities, highlights, and relevance scoring.

## API Endpoint
`GET /api/judgements`

## New Features Integrated

### 1. Full-Text Search
- **Parameter**: `search` (string)
- **Description**: Full-text search across PDF content, title, court_name, judge, and CNR
- **Frontend**: Automatically enables highlights when search is used
- **Example**: `?search=contract breach`

### 2. Search Highlights
- **Parameter**: `highlight` (boolean)
- **Description**: Returns highlighted search terms in results
- **Frontend**: Displays highlighted text in title and PDF content snippets
- **Example**: `?search=contract&highlight=true`

### 3. Enhanced Filtering
All filters now use Elasticsearch for fuzzy matching and relevance ranking:

- **court_name**: Fuzzy search for court names
- **judge**: Fuzzy search for judge names
- **title**: Search in judgment titles
- **cnr**: Exact match for CNR numbers
- **year**: Filter by decision date year
- **disposal_nature**: Filter by disposal nature
- **decision_date**: Filter by specific date (>=)
- **decision_date_from**: Start date for range (YYYY-MM-DD)
- **decision_date_to**: End date for range (YYYY-MM-DD)

### 4. Relevance Scoring
- **Field**: `relevance_score` (float)
- **Description**: Elasticsearch relevance score for search results
- **Frontend**: Displays relevance score in judgment cards (High Court only)

### 5. Search Metadata
- **Field**: `search_info` (object)
- **Contains**:
  - `query`: The search query used
  - `total_matches`: Total number of matches found
  - `search_engine`: "elasticsearch"
  - `took_ms`: Search execution time in milliseconds
- **Frontend**: Displays search statistics in a blue info box

### 6. Total Count
- **Parameter**: `include_total_count` (boolean)
- **Description**: Include total count in response (may slow down response)
- **Example**: `?include_total_count=true`

## Response Structure

```json
{
  "data": [
    {
      "id": 123,
      "judge": "Justice Kathawalla",
      "title": "Case Title",
      "decision_date": "2023-01-15",
      "pdf_link": "https://...",
      "cnr": "CNR123",
      "court_name": "Bombay High Court",
      "year": 2023,
      "relevance_score": 12.45,  // Only for Elasticsearch results
      "highlights": {              // Only when highlight=true
        "title": ["<mark>Contract</mark> Breach Case"],
        "pdf_text": [
          "<mark>contract</mark> was breached...",
          "...violation of the <mark>contract</mark> terms..."
        ]
      }
    }
  ],
  "next_cursor": {
    "decision_date": "2023-01-15",
    "id": 123
  },
  "pagination_info": {
    "current_page_size": 10,
    "has_more": true,
    "total_count": 150  // Only if include_total_count=true
  },
  "search_info": {  // Only for Elasticsearch searches
    "query": "contract",
    "total_matches": 150,
    "search_engine": "elasticsearch",
    "took_ms": 45
  }
}
```

## Frontend Implementation

### API Service (`src/services/api.js`)
- Updated `getJudgements()` to support all new parameters
- Automatically maps `pdf_link` to `pdf_url` for compatibility
- Preserves `relevance_score` and `highlights` from API response

### Legal Judgments Page (`src/pages/LegalJudgments.jsx`)
- **Highlights Display**: Shows highlighted search terms in title and PDF snippets
- **Relevance Score**: Displays relevance score in judgment cards (High Court only)
- **Search Info**: Shows search statistics (total matches, search engine, execution time)
- **Filter Mapping**: Properly maps frontend filter keys to API parameters

### Filter Support
- `highCourt` → `court_name`
- `decisionDateFrom` → `decision_date_from`
- `decisionDateTo` → `decision_date_to`
- `decisionDate` → `decision_date`
- `disposalNature` → `disposal_nature`
- `search` → `search` (with automatic highlight=true)
- `title`, `cnr`, `judge`, `year` → direct mapping

## Testing

### Using curl (Linux/Mac)
```bash
# Make script executable
chmod +x test-judgements-api.sh

# Edit script and replace YOUR_NGROK_URL with your ngrok URL
# Then run:
./test-judgements-api.sh
```

### Using curl (Windows)
```batch
# Edit test-judgements-api.bat and replace YOUR_NGROK_URL
# Then run:
test-judgements-api.bat
```

### Manual Testing Examples

1. **Basic Search with Highlights**:
```bash
curl -X GET "YOUR_NGROK_URL/api/judgements?search=contract&limit=5&highlight=true" \
  -H "Content-Type: application/json"
```

2. **Court Filter**:
```bash
curl -X GET "YOUR_NGROK_URL/api/judgements?court_name=Bombay&limit=5" \
  -H "Content-Type: application/json"
```

3. **Combined Filters**:
```bash
curl -X GET "YOUR_NGROK_URL/api/judgements?search=breach&court_name=Bombay&year=2022&limit=5&highlight=true" \
  -H "Content-Type: application/json"
```

4. **Date Range**:
```bash
curl -X GET "YOUR_NGROK_URL/api/judgements?decision_date_from=2020-01-01&decision_date_to=2023-12-31&limit=5" \
  -H "Content-Type: application/json"
```

## Key Features

1. **Smart Filtering**: 
   - Any filter provided uses Elasticsearch for fuzzy matching
   - No filters = fast PostgreSQL query

2. **Relevance Ranking**: 
   - Results sorted by relevance score (highest first)
   - Only for Elasticsearch searches

3. **Highlighting**: 
   - Search terms highlighted in results
   - Works with full-text search or field filters

4. **Performance**: 
   - Fast PostgreSQL queries when no filters
   - Elasticsearch for advanced searches
   - Search metadata shows execution time

## Notes

- Highlights are only available for High Court judgments
- Relevance scores are only shown for Elasticsearch results
- Search info is only included when Elasticsearch is used
- All date parameters should be in YYYY-MM-DD format
- The API automatically falls back to PostgreSQL if Elasticsearch is unavailable

