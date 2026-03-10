// Emergency Button Creator - Run this in browser console if button doesn't appear
console.log('🚨 Verdiqt Emergency Button Creator');

// Remove any existing button
const existing = document.getElementById('verdiqt-float-btn');
if (existing) {
    existing.remove();
    console.log('Removed existing button');
}

// Create emergency button
const btn = document.createElement('div');
btn.id = 'verdiqt-float-btn';
btn.innerHTML = 'V';
btn.title = 'Verdiqt - Emergency Button';

// Maximum priority styles
btn.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    width: 60px !important;
    height: 60px !important;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%) !important;
    color: white !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 24px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    z-index: 2147483647 !important;
    box-shadow: 0 4px 20px rgba(255, 107, 107, 0.6) !important;
    font-family: Arial, sans-serif !important;
    border: 3px solid rgba(255,255,255,0.5) !important;
    user-select: none !important;
    pointer-events: auto !important;
    text-align: center !important;
    line-height: 1 !important;
    animation: pulse 2s infinite !important;
`;

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Add click handler
btn.addEventListener('click', () => {
    alert('🚨 Emergency Verdiqt Button Active!\n\n✅ This confirms the extension can create buttons.\n\n🔧 Next steps:\n1. Reload the extension\n2. Refresh this page\n3. The normal button should appear');
});

// Force append to body
document.body.appendChild(btn);

console.log('✅ Emergency button created! Look for the red pulsing button in bottom-right corner.');
console.log('📍 Button position should be: bottom-right corner of the page');

// Verify it worked
setTimeout(() => {
    const check = document.getElementById('verdiqt-float-btn');
    if (check) {
        const rect = check.getBoundingClientRect();
        console.log('✅ Emergency button verified:', {
            exists: true,
            visible: rect.width > 0 && rect.height > 0,
            position: rect
        });
    } else {
        console.log('❌ Emergency button creation failed');
    }
}, 100);