# Verdiqt Debugging Guide

## Current Issues from Screenshot:

1. ✅ Sidebar opens (good!)
2. ❌ Sidebar shows empty/dark (no content loading)
3. ❌ No sentiment badges appearing beside comments
4. ❌ No interaction/analysis happening

## Steps to Debug:

### 1. Open Chrome DevTools (F12)
- Go to Console tab
- Look for "Verdiqt:" messages

### 2. Expected Console Messages (in order):
```
Verdiqt content script loaded
Verdiqt: Injecting styles...
Verdiqt: Styles injected successfully
[Click V button]
Verdiqt: Toggling sidebar
Verdiqt: Sidebar element found: false
Verdiqt: Sidebar not found, injecting...
Verdiqt: Injecting sidebar...
Verdiqt: Found sidebar element in HTML
Verdiqt: Final sidebar check: true
Verdiqt sidebar loaded
Verdiqt: Creating sidebar instance...
Verdiqt: Initializing sidebar class...
Verdiqt: Finding sidebar elements...
Verdiqt: Sidebar element: true
Verdiqt: Loading section: true
Verdiqt: Setting up event listeners...
Verdiqt: Setting up message listener...
Verdiqt: Starting automatic analysis...
Verdiqt: Starting analysis...
Verdiqt: Showing section: loading
Verdiqt: Requesting reviews from content script...
Verdiqt: Sending SCRAPE_REVIEWS message...
Verdiqt: Scraping reviews...
Verdiqt: Using selector: [data-hook="review-body"] span
Verdiqt: Found X reviews
Verdiqt: Received message from content: REVIEWS_DATA
Verdiqt: Handling reviews data...
Verdiqt: Found X reviews
Verdiqt: Calling backend...
Verdiqt: Fetching from backend with X reviews
Verdiqt: Backend response: {...}
Verdiqt: Got results: {...}
Verdiqt: Displaying results...
Verdiqt: Rendering X reviews
Verdiqt: Reviews rendered successfully
Verdiqt: Sending badge injection message...
Verdiqt: Injecting badges...
Verdiqt: Injected X sentiment badges
```

### 3. Check for Errors:
Look for any RED error messages in console that say:
- "Cannot read properties of null"
- "Failed to fetch"
- "CORS error"
- "Timeout waiting for reviews"

### 4. Common Issues & Solutions:

#### Issue: "Timeout waiting for reviews"
- **Cause**: Content script not responding
- **Solution**: Reload extension, refresh page

#### Issue: "Cannot connect to backend"
- **Cause**: Backend not running
- **Solution**: Run `cd verdiqt/backend && uvicorn main:app --reload`

#### Issue: "No reviews found"
- **Cause**: Wrong page or selectors not matching
- **Solution**: Make sure you're on a product page with reviews visible

#### Issue: Sidebar shows but stays empty
- **Cause**: sidebar.js not initializing
- **Check**: Look for "Verdiqt sidebar loaded" in console
- **Solution**: Reload extension

### 5. Manual Test Commands:

Open Console and run these to test manually:

```javascript
// Test if sidebar exists
document.getElementById('verdiqt-sidebar')

// Test sending message
window.postMessage({ source: "VERDIQT_SIDEBAR", action: "SCRAPE_REVIEWS" }, "*")

// Test if reviews can be found
document.querySelectorAll('[data-hook="review-body"] span').length

// Test backend connection
fetch('http://localhost:8000/health').then(r => r.json()).then(console.log)
```

### 6. Quick Fixes:

1. **Reload Extension**:
   - Go to `chrome://extensions/`
   - Click reload button on Verdiqt

2. **Refresh Amazon Page**:
   - Press F5 or Ctrl+R

3. **Check Backend**:
   - Open http://localhost:8000/health
   - Should show: `{"status":"ok","models_loaded":true}`

4. **Clear Console**:
   - Click clear button in DevTools
   - Click V button again
   - Watch messages appear in order

### 7. What to Share for Help:

If still not working, share:
1. Screenshot of Console tab (all messages)
2. Screenshot of Network tab (if backend errors)
3. URL of Amazon page you're testing on
4. Any RED error messages

## Expected Behavior:

1. Click V button → Sidebar slides in
2. Shows "Analyzing reviews..." spinner
3. After 2-5 seconds → Shows results:
   - Overall stats (X% positive, Y% negative, Z% neutral)
   - List of reviews with sentiment badges
4. Colored badges appear beside each review on the page