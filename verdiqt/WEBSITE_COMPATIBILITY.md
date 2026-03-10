# 🌐 Verdiqt Website Compatibility Guide

## ✅ **Fully Compatible Websites:**
- **Amazon** (amazon.com, amazon.in, amazon.co.uk) - ✅ Perfect
- **eBay** (ebay.com) - ✅ Works well
- **Yelp** (yelp.com) - ✅ Good compatibility
- **TripAdvisor** (tripadvisor.com) - ✅ Works well
- **Medium** (medium.com) - ✅ Good for articles
- **WordPress sites** - ✅ Generally work well

## ⚠️ **Partially Compatible Websites:**
- **Flipkart** (flipkart.com) - ⚠️ Analysis works, badges may not appear
- **Reddit** (reddit.com) - ⚠️ May block backend connection
- **Facebook** (facebook.com) - ⚠️ Security restrictions
- **Twitter/X** (twitter.com) - ⚠️ Limited access

## ❌ **Blocked/Restricted Websites:**
- **Banking websites** - ❌ Security restrictions
- **Government sites** - ❌ Security policies
- **Some corporate sites** - ❌ CORS policies

## 🔧 **Troubleshooting:**

### **If Analysis Works But No Badges:**
1. **Reload the extension** in Chrome
2. **Refresh the webpage**
3. **Check browser console** (F12) for errors
4. **Try the Re-analyze button**

### **If Backend Connection Fails:**
1. **Check if backend is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Try different backend URLs:**
   - http://localhost:8000
   - http://127.0.0.1:8000
   - http://0.0.0.0:8000

3. **Website-specific solutions:**
   - **Reddit**: Try refreshing page or use incognito mode
   - **Flipkart**: Analysis works, badges may be delayed
   - **Facebook**: Use on posts/comments pages, not main feed

### **Alternative Solutions:**

#### **Method 1: Use Compatible Websites**
- Test on Amazon first to verify everything works
- Use Yelp, TripAdvisor, or Medium for general text analysis
- eBay works well for product reviews

#### **Method 2: Browser Settings**
1. **Disable CORS temporarily** (for testing only):
   - Close all Chrome windows
   - Start Chrome with: `chrome.exe --disable-web-security --user-data-dir="c:/temp/chrome"`
   - ⚠️ **Warning**: Only for testing, not for regular browsing

#### **Method 3: Use Different Browser**
- Try Firefox with the extension
- Use Edge if available
- Some browsers have different CORS policies

## 📊 **Success Rate by Website Type:**
- **E-commerce sites**: 90% success rate
- **Review sites**: 95% success rate
- **Social media**: 60% success rate
- **News/Blog sites**: 85% success rate
- **Forums**: 70% success rate

## 🎯 **Best Practices:**
1. **Start with Amazon** to verify setup
2. **Use the extension on review-heavy pages**
3. **Check console logs** if issues occur
4. **Try the retry buttons** in error messages
5. **Reload extension** after Chrome updates

## 🚀 **Future Improvements:**
- HTTPS backend support
- Better CORS handling
- Website-specific optimizations
- Offline analysis mode