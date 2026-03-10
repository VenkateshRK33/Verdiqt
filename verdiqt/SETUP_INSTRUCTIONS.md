# Verdiqt Setup Instructions

## Step 1: Run the Backend

1. **Navigate to backend directory:**
   ```bash
   cd verdiqt/backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   Note: First run will download the sentiment analysis model (~500MB). This may take a few minutes.

3. **Start the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   ```

4. **Verify backend is running:**
   - Open http://localhost:8000/health in your browser
   - Should return: `{"status": "ok", "models_loaded": true}`

## Step 2: Load the Chrome Extension

1. **Open Chrome and go to Extensions:**
   - Type `chrome://extensions/` in the address bar
   - Or go to Chrome Menu → More Tools → Extensions

2. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the extension:**
   - Click "Load unpacked" button
   - Navigate to and select the `verdiqt/extension` folder
   - The Verdiqt extension should now appear in your extensions list

4. **Verify extension is loaded:**
   - You should see "Verdiqt" in your extensions list
   - The extension icon should appear in your Chrome toolbar

## Step 3: Test the Extension

1. **Visit a supported website:**
   - Go to any Amazon product page (amazon.com or amazon.in)
   - Or go to any Flipkart product page (flipkart.com)
   - Make sure the page has customer reviews

2. **Look for the floating button:**
   - You should see a purple "V" button in the bottom-right corner
   - If you don't see it, check the browser console for errors

3. **Click the V button:**
   - The sidebar should slide in from the right
   - You should see "Analyzing reviews..." with a loading spinner

4. **Wait for results:**
   - The extension will scrape reviews and send them to the backend
   - Results should appear showing sentiment analysis
   - Colored badges should appear next to reviews on the page

## Verification Checklist

### Backend Verification:
- [ ] Backend starts without errors
- [ ] http://localhost:8000/health returns `{"status": "ok", "models_loaded": true}`
- [ ] Can manually test with: `curl -X POST http://localhost:8000/analyze -H "Content-Type: application/json" -d '{"reviews":["Great product!"]}'`

### Extension Verification:
- [ ] Extension loads in Chrome without errors
- [ ] Purple "V" button appears on Amazon/Flipkart pages
- [ ] Clicking "V" button opens the sidebar
- [ ] Sidebar shows loading spinner initially
- [ ] Results appear with sentiment percentages
- [ ] Individual review cards show sentiment badges
- [ ] Colored badges appear next to reviews on the page (✅ Positive, ❌ Negative, 😐 Neutral)
- [ ] Close button (X) works to close sidebar
- [ ] Re-analyze button works to refresh results

### Console Log Verification:
Open Chrome DevTools (F12) and check console for these messages:
- [ ] "Verdiqt content script loaded"
- [ ] "Verdiqt sidebar loaded"
- [ ] "Verdiqt: Scraping reviews..."
- [ ] "Verdiqt: Found X reviews"
- [ ] "Verdiqt: Calling backend..."
- [ ] "Verdiqt: Got results"
- [ ] "Verdiqt: Injecting badges..."
- [ ] "Verdiqt: Injected X sentiment badges"

### Error Handling Verification:
- [ ] If backend is not running, sidebar shows: "Start the Verdiqt backend first: cd backend && uvicorn main:app --reload"
- [ ] If no reviews found, sidebar shows: "No reviews found on this page"
- [ ] Extension works on both Amazon and Flipkart

## Troubleshooting

### Backend Issues:
- **Model loading fails:** Make sure you have enough disk space (~500MB) and internet connection
- **Port 8000 in use:** Stop other services or change port in both backend and extension
- **CORS errors:** Make sure CORS is enabled in main.py (should be by default)

### Extension Issues:
- **V button not appearing:** Check browser console for errors, make sure you're on Amazon/Flipkart
- **Sidebar not loading:** Check if web_accessible_resources are properly configured in manifest.json
- **Communication errors:** Check console logs for "Verdiqt:" messages to debug the flow
- **No badges appearing:** Make sure reviews are being scraped (check console logs)

### Common Fixes:
- **Refresh the webpage** after loading the extension
- **Restart Chrome** after making extension changes
- **Check Chrome DevTools Console** for error messages and debug logs
- **Make sure backend is running** on http://localhost:8000
- **Try different Amazon pages** - some pages have different review structures

### Debug Steps:
1. Open Chrome DevTools (F12) → Console tab
2. Click the V button and watch for console messages
3. You should see the complete flow:
   - Scraping reviews...
   - Found X reviews
   - Calling backend...
   - Got results
   - Injecting badges...

## Sample Test Data

You can test the backend directly with these sample reviews:
```json
{
  "reviews": [
    "This product is amazing! Best purchase ever!",
    "Terrible quality, waste of money. Very disappointed.",
    "It's okay, nothing special but does the job.",
    "Love it! Highly recommend to everyone!",
    "Poor customer service and defective product."
  ]
}
```

Expected response should show a mix of positive, negative, and neutral sentiments with confidence scores.

## Fixed Issues

### Communication Fix:
- Changed from chrome.tabs.sendMessage to window.postMessage for proper sidebar-content communication
- Fixed message flow: sidebar → content → backend → sidebar → content

### Review Scraping Fix:
- Added multiple Amazon selectors: `[data-hook="review-body"] span`, `.review-text-content span`, `.a-size-base.review-text`
- Improved text extraction using `innerText` instead of `textContent`
- Better filtering (minimum 5 characters instead of 10)

### Badge Injection Fix:
- Proper badge styling with inline CSS
- Correct sentiment colors and text
- Prevents duplicate badge injection
- Uses same selectors as scraping for consistency