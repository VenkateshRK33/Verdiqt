#!/usr/bin/env python3
"""
Verdiqt Logo Setup Script
Automatically copies your logo and sets up the extension
"""

import os
import shutil
import sys

def main():
    print("🎨 Verdiqt Logo Setup Script")
    print("=" * 30)
    print()
    
    # Source and destination paths
    source_path = r"C:\Users\11one\Downloads\Gemini_Generated_Image_b8s7uxb8s7uxb8s7.png"
    dest_path = r"verdiqt\extension\logo.png"
    
    print("📁 Copying logo file...")
    
    try:
        # Check if source file exists
        if not os.path.exists(source_path):
            print(f"❌ Source file not found: {source_path}")
            print("   Please check if the file exists in your Downloads folder")
            input("Press Enter to exit...")
            return
        
        # Create destination directory if it doesn't exist
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        
        # Copy the file
        shutil.copy2(source_path, dest_path)
        
        if os.path.exists(dest_path):
            print(f"✅ Logo file copied successfully!")
            print(f"   Location: {dest_path}")
        else:
            print("❌ Failed to copy logo file")
            return
            
    except Exception as e:
        print(f"❌ Error copying file: {e}")
        input("Press Enter to exit...")
        return
    
    print()
    print("🔍 Verifying extension files...")
    
    # Check extension files
    extension_files = [
        "verdiqt/extension/content.js",
        "verdiqt/extension/manifest.json", 
        "verdiqt/extension/sidebar.js",
        "verdiqt/extension/sidebar.css",
        "verdiqt/extension/sidebar.html"
    ]
    
    all_files_exist = True
    for file_path in extension_files:
        if os.path.exists(file_path):
            print(f"✅ {os.path.basename(file_path)} found")
        else:
            print(f"❌ {os.path.basename(file_path)} missing")
            all_files_exist = False
    
    print()
    if all_files_exist:
        print("🎯 Setup Complete!")
        print()
        print("📋 Next Steps:")
        print("1. Open Chrome and go to chrome://extensions/")
        print("2. Find 'Verdiqt' extension")
        print("3. Click the reload button (🔄)")
        print("4. Refresh any open webpages")
        print("5. Look for your logo in the bottom-right corner!")
    else:
        print("⚠️  Some extension files are missing. Please check the setup.")
    
    print()
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()