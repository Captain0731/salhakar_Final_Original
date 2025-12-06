# Backend Code Changes for Judge and CNR Highlights

## Exact Code Changes Required

### Change 1: Update Highlight Fields Configuration

**Find this section in your `get_judgements` endpoint (around the highlight configuration):**

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
    "highlight_query": {
        "multi_match": {
            "query": highlight_query,
            "fields": highlight_fields if highlight_fields else ["pdf_text", "title"],
            "type": "best_fields"
        }
    }
}
```

**Replace with:**

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
    "highlight_query": {
        "multi_match": {
            "query": highlight_query,
            "fields": highlight_fields if highlight_fields else ["pdf_text", "title", "judge", "cnr"],  # UPDATE THIS
            "type": "best_fields"
        }
    }
}
```

### Change 2: Add CNR to highlight_fields list

**Find this section:**

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

**Replace with:**

```python
highlight_fields = []
if title:
    highlight_terms.append(title)
    highlight_fields.append("title")
if judge:
    highlight_terms.append(judge)
    highlight_fields.append("judge")
if cnr:  # ADD THIS BLOCK
    highlight_terms.append(cnr)
    highlight_fields.append("cnr")
if court_name:
    highlight_terms.append(court_name)
    highlight_fields.append("court_name")
```

## Summary of Changes

1. ✅ Added `"judge"` field to highlight `fields` configuration
2. ✅ Added `"cnr"` field to highlight `fields` configuration
3. ✅ Added `cnr` to `highlight_fields` list
4. ✅ Updated default fields in `highlight_query` to include `"judge"` and `"cnr"`

## Testing After Changes

Run these commands to verify:

```bash
# Test judge highlights
curl "YOUR_NGROK_URL/api/judgements?judge=kathawalla&limit=1&highlight=true" | jq '.data[0].highlights.judge'

# Test CNR highlights  
curl "YOUR_NGROK_URL/api/judgements?cnr=YOUR_CNR&limit=1&highlight=true" | jq '.data[0].highlights.cnr'

# Test title highlights (should still work)
curl "YOUR_NGROK_URL/api/judgements?title=contract&limit=1&highlight=true" | jq '.data[0].highlights.title'
```

Expected output should show highlighted text with `<mark>` tags around matching terms.

