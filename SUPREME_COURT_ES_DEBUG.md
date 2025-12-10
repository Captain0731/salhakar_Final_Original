# Supreme Court Elasticsearch Debug Guide

## Expected API Response Structure

Based on the API documentation, the response should look like:

```json
{
  "success": true,
  "query": "land acquisition",
  "total_results": 10000,
  "returned_results": 3,
  "results": [
    {
      "id": 147017,
      "title": "MUNUSAMY versus THE LAND ACQUISITION OFFICER",
      "petitioner": "MUNUSAMY",
      "respondent": "THE LAND ACQUISITION OFFICER",
      "judge": "M.R. SHAH",
      "citation": "[2021] 9 S.C.R. 1",
      "cnr": "ESCR010005182021",
      "decision_date": "2021-09-29",
      "disposal_nature": "Case Partly allowed",
      "court": "Supreme Court of India",
      "year": 2021,
      "pdf_url": "https://…/supreme_court/year=2021/english/2021_9_1_6_EN.pdf",
      "score": 2361.99,
      "highlight": {
        "pdf_text": ["...highlighted text with <mark>tags</mark>..."],
        "title": ["...highlighted title with <mark>tags</mark>..."]
      }
    }
  ],
  "search_engine": "elasticsearch"
}
```

## Key Points:

1. **Highlight Object**: Each result has a `highlight` object (singular, not `highlights`)
2. **Highlight Structure**: 
   - `highlight.pdf_text` - Array of highlighted PDF text fragments
   - `highlight.title` - Array of highlighted title fragments
3. **HTML Tags**: Highlights contain `<mark>` tags for highlighting

## Debugging Steps:

1. **Check Console Logs**: Look for logs starting with `🔍`
2. **Verify API Response**: Check `🔍 Supreme Court ES Raw Response` log
3. **Check Highlight Structure**: Look at `🔍 First Result Highlight Structure` log
4. **Verify Processing**: Check `🔍 Processed Highlights` log
5. **Check Rendering**: Look at `🔍 Rendering Title` and `🔍 Rendering PDF Highlights` logs

## Common Issues:

1. **No highlights in response**: API might not be returning highlights
2. **Wrong structure**: Highlights might be in different format
3. **Processing issue**: Highlights might not be properly processed
4. **Rendering issue**: Highlights might not be displayed correctly

## Test with Curl:

```bash
curl "http://localhost:8004/api/supreme-court-judgements/search?q=land%20acquisition&size=2" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true"
```

Or with authentication:
```bash
curl "http://localhost:8004/api/supreme-court-judgements/search?q=land%20acquisition&size=2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "ngrok-skip-browser-warning: true"
```

