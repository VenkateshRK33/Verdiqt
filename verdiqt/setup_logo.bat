@echo off
echo 🎨 Verdiqt Logo Setup Script
echo ============================

echo.
echo 📁 Copying logo file...

REM Copy the logo file from Downloads to extension folder
copy "C:\Users\11one\Downloads\Gemini_Generated_Image_b8s7uxb8s7uxb8s7.png" "verdiqt\extension\logo.png"

if exist "verdiqt\extension\logo.png" (
    echo ✅ Logo file copied successfully!
    echo    Location: verdiqt\extension\logo.png
) else (
    echo ❌ Failed to copy logo file
    echo    Please check if the file exists at:
    echo    C:\Users\11one\Downloads\Gemini_Generated_Image_b8s7uxb8s7uxb8s7.png
    pause
    exit /b 1
)

echo.
echo 🔍 Verifying extension files...

if exist "verdiqt\extension\content.js" (
    echo ✅ content.js found
) else (
    echo ❌ content.js missing
)

if exist "verdiqt\extension\manifest.json" (
    echo ✅ manifest.json found
) else (
    echo ❌ manifest.json missing
)

if exist "verdiqt\extension\sidebar.js" (
    echo ✅ sidebar.js found
) else (
    echo ❌ sidebar.js missing
)

echo.
echo 🎯 Setup Complete!
echo.
echo 📋 Next Steps:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Find "Verdiqt" extension
echo 3. Click the reload button (🔄)
echo 4. Refresh any open webpages
echo 5. Look for your logo in the bottom-right corner!
echo.

pause