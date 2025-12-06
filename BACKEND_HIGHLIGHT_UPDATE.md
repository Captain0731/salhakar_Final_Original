# Backend Highlight Configuration Update

## Issue
The current backend highlight configuration only includes `pdf_text` and `title` fields. To support highlighting for `judge` and `cnr` fields, the backend needs to be updated.

## Required Backend Changes

### Update the Highlight Configuration

In the `get_judgements` endpoint, update the highlight configuration section to include `judge` and `cnr` fields:

**Current Code (around line with highlight configuration):**
```python
es_query["highlight"] = {
    "max_analyzed_offset": 1000000,
    "fields": {
        "pdf_text": {
            "fragment_size": 200,
            "number_of_fragments": 3,
            "pre_tags": ["<mark>"],
            "post_tags": ["</mark>"],
            "max_analyzed_offset": 1000000
        },
        "title": {
            "pre_tags": ["<mark>"],
            "post_tags": ["</mark>"]
        }
    },
    # ... highlight_query ...
}
```

**Updated Code (add judge and cnr fields):**
```python
es_query["highlight"] = {
    "max_analyzed_offset": 1000000,
    "fields": {
        "pdf_text": {
            "fragment_size": 200,
            "number_of_fragments": 3,
            "pre_tags": ["<mark>"],
            "post_tags": ["</mark>"],
            "max_analyzed_offset": 1000000
        },
        "title": {
            "pre_tags": ["<mark>"],
            "post_tags": ["</mark>"]
        },
        "judge": {  # ADD THIS
            "pre_tags": ["<mark>"],
            "post_tags": ["</mark>"]
        },
        "cnr": {  # ADD THIS
            "pre_tags": ["<mark>"],
            "post_tags": ["</mark>"]
        }
    },
    # ... highlight_query ...
}
```

### Update Highlight Fields List

Also update the `highlight_fields` list to include `judge` and `cnr`:

**Current Code:**
```python
highlight_fields = []
if title:
    highlight_terms.append(title)
    highlight_fields.append("title")
if judge:
    highlight_terms.append(judge)
    highlight_fields.append("judge")
if court_name:
    highlight_terms.append(court_name)
    highlight_fields.append("court_name")
```

**Updated Code (add cnr to highlight_fields):**
```python
highlight_fields = []
if title:
    highlight_terms.append(title)
    highlight_fields.append("title")
if judge:
    highlight_terms.append(judge)
    highlight_fields.append("judge")
if cnr:  # ADD THIS
    highlight_terms.append(cnr)
    highlight_fields.append("cnr")
if court_name:
    highlight_terms.append(court_name)
    highlight_fields.append("court_name")
```

### Update Highlight Query Fields

Update the `highlight_query` to include `judge` and `cnr` in the fields array:

**Current Code:**
```python
"highlight_query": {
    "multi_match": {
        "query": highlight_query,
        "fields": highlight_fields if highlight_fields else ["pdf_text", "title"],
        "type": "best_fields"
    }
}
```

**Updated Code:**
```python
"highlight_query": {
    "multi_match": {
        "query": highlight_query,
        "fields": highlight_fields if highlight_fields else ["pdf_text", "title", "judge", "cnr"],
        "type": "best_fields"
    }
}
```

## Expected Response Structure

After the update, the API should return highlights in this format:

```json
{
  "data": [
    {
      "id": 123,
      "title": "Case Title",
      "judge": "Justice Kathawalla",
      "cnr": "CNR123456",
      "highlights": {
        "title": ["<mark>Contract</mark> Breach Case"],
        "judge": ["Justice <mark>Kathawalla</mark>"],
        "cnr": ["<mark>CNR123456</mark>"],
        "pdf_text": [
          "The <mark>contract</mark> was breached...",
          "...violation of the <mark>contract</mark> terms..."
        ]
      }
    }
  ]
}
```

## Testing

After updating the backend, test using:

```bash
# Test judge highlights
curl -X GET "YOUR_NGROK_URL/api/judgements?judge=kathawalla&limit=1&highlight=true" \
  -H "Content-Type: application/json" | jq '.data[0].highlights'

# Test CNR highlights
curl -X GET "YOUR_NGROK_URL/api/judgements?cnr=YOUR_CNR&limit=1&highlight=true" \
  -H "Content-Type: application/json" | jq '.data[0].highlights'

# Test title highlights
curl -X GET "YOUR_NGROK_URL/api/judgements?title=contract&limit=1&highlight=true" \
  -H "Content-Type: application/json" | jq '.data[0].highlights'
```

## Frontend Status

✅ **Frontend is already ready** to display highlights for:
- Title (already working)
- Judge name (ready, waiting for backend)
- CNR number (ready, waiting for backend)
- PDF text (already working)

The frontend will automatically display highlights once the backend returns them in the response.

