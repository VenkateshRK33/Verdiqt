# 🔧 Verdiqt Extension Debug Guide

## 🚨 **V Button Not Visible - Troubleshooting Steps:**

### **Step 1: Check Extension Status**
1. Go to `chrome://extensions/`
2. Find "Verdiqt" extension
3. Make sure it's **enabled** (toggle switch is blue)
4. Check if there are any **error messages** in red

### **Step 2: Reload Extension**
1. In `chrome://extensions/`
2. Click the **reload button** (🔄) on Verdiqt extension
3. **Refresh the webpage** you're testing on
4. Look for the purple "V" button in bottom-right corner

### **Step 3: Check Browser Console**
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for messages starting with "Verdiqt:"
4. **Expected messages:**
   ```
   Verdiqt content script loaded on: [URL]
   Verdiqt: VerdiqtContent constructor called
   Verdiqt: Starting initialization...
   Verdiqt: Styles injected, creating button...
   Verdiqt: Button created, setting up listeners...
   Verdiqt: Floating button created and added to page
   Verdiqt: Button verification successful - button is in DOM
   ```

### **Step 4: Manual Button Check**
1. In browser console, paste this code:
   ```javascript
   console.log('Button exists:', !!document.getElementById('verdiqt-float-btn'));
   ```
2. If it returns `false`, the button wasn't created

### **Step 5: Force Create Button**
1. In browser console, paste this code:
   ```javascript
   // Force create button
   const btn = document.createElement('div');
   btn.id = 'verdiqt-test-btn';
   btn.innerHTML = 'V';
   btn.style.cssText = 'position:fixed!important;bottom:20px!important;right:20px!important;width:60px!important;height:60px!important;background:#667EEA!important;color:white!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:24px!important;font-weight:bold!important;cursor:pointer!important;z-index:999999!important;';
   btn.onclick = () => alert('Button works!');
   document.body.appendChild(btn);
   console.log('Test button created');
   ```

### **Step 6: Check for Conflicts**
1. **Disable other extensions** temporarily
2. **Try incognito mode** (enable extension in incognito)
3. **Test on different websites:**
   - Amazon.com (should work)
   - Google.com (simple test)
   - Any HTTP site

### **Step 7: Extension Permissions**
1. In `chrome://extensions/`
2. Click **Details** on Verdiqt extension
3. Make sure **"Allow on all sites"** is enabled
4. Check **"Allow in incognito"** if testing in incognito

## 🧪 **Quick Test Websites:**
- **Amazon.com** - Best compatibility
- **Google.com** - Simple test
- **Example.com** - Basic HTML
- **httpbin.org** - HTTP test site

## 🔍 **Common Issues & Solutions:**

### **Issue: Extension Not Loading**
- **Solution**: Reload extension, refresh page
- **Check**: Extension enabled, permissions granted

### **Issue: Button Hidden Behind Other Elements**
- **Solution**: Check z-index in console
- **Test**: Right-click → Inspect element on button area

### **Issue: Content Script Blocked**
- **Solution**: Try different website
- **Check**: Website's Content Security Policy

### **Issue: JavaScript Errors**
- **Solution**: Check console for errors
- **Fix**: Reload extension, clear browser cache

## 📋 **Debug Checklist:**
- [ ] Extension enabled in Chrome
- [ ] Extension reloaded after changes
- [ ] Webpage refreshed
- [ ] Console shows Verdiqt messages
- [ ] No JavaScript errors
- [ ] Tested on multiple websites
- [ ] Permissions granted
- [ ] Other extensions disabled (test)

## 🚀 **If Nothing Works:**
1. **Uninstall and reinstall** the extension
2. **Restart Chrome** completely
3. **Try a different browser** (Edge, Firefox)
4. **Check Windows firewall/antivirus** blocking

## 📞 **Success Indicators:**
- Purple "V" button visible in bottom-right
- Console shows "Verdiqt: Button verification successful"
- Button responds to hover (grows slightly)
- Clicking button opens sidebar or shows loading

The extension should work on most websites once properly loaded! 🌟