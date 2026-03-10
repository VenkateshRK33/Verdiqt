// Content script that runs on web pages for Verdiqt extension
console.log('Verdiqt content script loaded');

class VerdiqtContent {
    constructor() {
        this.sidebarInjected = false;
        this.sidebarVisible = false;
        this.init();
    }

    async init() {
        await this.injectStyles(); // Inject styles first and wait
        this.createFloatingButton();
        this.setupMessageListener();
    }

    async injectStyles() {
        try {
            console.log('Verdiqt: Injecting styles...');
            
            // Fetch CSS content directly and inject as style tag
            const cssUrl = chrome.runtime.getURL('sidebar.css');
            const response = await fetch(cssUrl);
            const cssContent = await response.text();
            
            // Create style tag with CSS content
            const style = document.createElement('style');
            style.id = 'verdiqt-styles';
            style.textContent = cssContent;
            document.head.appendChild(style);
            
            console.log('Verdiqt: Styles injected successfully');
        } catch (error) {
            console.error('Verdiqt: Failed to inject styles:', error);
            
            // Fallback: try link tag method
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = chrome.runtime.getURL('sidebar.css');
            document.head.appendChild(link);
        }
    }

    createFloatingButton() {
        // Create floating button
        const button = document.createElement('div');
        button.id = 'verdiqt-float-btn';
        button.innerHTML = 'V';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #667EEA;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // Add hover effect
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
        });

        // Add click handler
        button.addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.body.appendChild(button);
    }

    async toggleSidebar() {
        console.log('Verdiqt: Toggling sidebar');
        
        let sidebar = document.getElementById('verdiqt-sidebar');
        console.log('Verdiqt: Sidebar element found:', !!sidebar);
        
        // If sidebar doesn't exist yet, create and inject it first
        if (!sidebar) {
            console.log('Verdiqt: Sidebar not found, injecting...');
            const injectedSidebar = await this.injectSidebar();
            
            if (!injectedSidebar) {
                console.error('Verdiqt: Sidebar injection failed, trying simple fallback...');
                // Simple fallback: create basic sidebar structure
                this.createFallbackSidebar();
            }
            
            sidebar = document.getElementById('verdiqt-sidebar');
            console.log('Verdiqt: Sidebar after injection:', !!sidebar);
        }

        // Only toggle if sidebar now exists
        if (sidebar) {
            this.sidebarVisible = !this.sidebarVisible;
            console.log('Verdiqt: Setting sidebar visible to:', this.sidebarVisible);
            
            if (this.sidebarVisible) {
                sidebar.classList.add('visible');
            } else {
                sidebar.classList.remove('visible');
            }
        } else {
            console.error('Verdiqt: Sidebar could not be created - element is still null');
            console.error('Verdiqt: Available elements with verdiqt in ID:', 
                Array.from(document.querySelectorAll('[id*="verdiqt"]')).map(el => el.id));
        }
    }

    createFallbackSidebar() {
        console.log('Verdiqt: Creating fallback sidebar...');
        
        const sidebar = document.createElement('div');
        sidebar.id = 'verdiqt-sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h2>Verdiqt</h2>
                <button id="close-sidebar" class="close-btn">×</button>
            </div>
            <div id="loading-section" class="section">
                <div class="spinner"></div>
                <p>Analyzing reviews...</p>
            </div>
            <div id="results-section" class="section hidden">
                <div class="stats-container">
                    <div class="stat-box positive">
                        <div class="stat-number" id="positive-percent">0%</div>
                        <div class="stat-label">Positive</div>
                    </div>
                    <div class="stat-box negative">
                        <div class="stat-number" id="negative-percent">0%</div>
                        <div class="stat-label">Negative</div>
                    </div>
                    <div class="stat-box neutral">
                        <div class="stat-number" id="neutral-percent">0%</div>
                        <div class="stat-label">Neutral</div>
                    </div>
                </div>
                <div id="reviews-list" class="reviews-container"></div>
            </div>
            <div id="error-section" class="section hidden">
                <div class="error-message">
                    <p id="error-text">Could not connect to Verdiqt backend.</p>
                </div>
            </div>
            <div class="sidebar-footer">
                <button id="reanalyze-btn" class="reanalyze-btn">Re-analyze</button>
            </div>
        `;
        
        document.body.appendChild(sidebar);
        
        // Load sidebar JS
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('sidebar.js');
        document.body.appendChild(script);
        
        console.log('Verdiqt: Fallback sidebar created');
        return sidebar;
    }

    async injectSidebar() {
        try {
            console.log('Verdiqt: Injecting sidebar...');
            
            // Fetch sidebar HTML
            const sidebarUrl = chrome.runtime.getURL('sidebar.html');
            const response = await fetch(sidebarUrl);
            const sidebarHTML = await response.text();

            console.log('Verdiqt: Fetched sidebar HTML, length:', sidebarHTML.length);

            // Create a temporary DOM parser to parse the HTML properly
            const parser = new DOMParser();
            const doc = parser.parseFromString(sidebarHTML, 'text/html');
            
            // Find the sidebar element in the parsed document
            let sidebarElement = doc.querySelector('#verdiqt-sidebar');
            
            if (!sidebarElement) {
                console.log('Verdiqt: Sidebar element not found in parsed HTML, trying alternative method...');
                
                // Alternative method: create container and extract content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = sidebarHTML;
                sidebarElement = tempDiv.querySelector('#verdiqt-sidebar');
                
                if (!sidebarElement) {
                    console.log('Verdiqt: Still no sidebar element, creating manually...');
                    
                    // Last resort: extract body content and create sidebar
                    const bodyMatch = sidebarHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                    if (bodyMatch) {
                        const bodyContent = bodyMatch[1];
                        sidebarElement = document.createElement('div');
                        sidebarElement.id = 'verdiqt-sidebar';
                        sidebarElement.innerHTML = bodyContent;
                    }
                }
            }

            if (sidebarElement) {
                console.log('Verdiqt: Found/created sidebar element, appending to body...');
                
                // Clone the element to ensure it's properly attached to this document
                const clonedSidebar = sidebarElement.cloneNode(true);
                document.body.appendChild(clonedSidebar);
                
                console.log('Verdiqt: Sidebar element appended');
            } else {
                console.error('Verdiqt: Could not create sidebar element');
                return null;
            }

            // Load sidebar JS
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('sidebar.js');
            script.onload = () => console.log('Verdiqt: Sidebar JS loaded');
            script.onerror = (e) => console.error('Verdiqt: Failed to load sidebar JS:', e);
            document.body.appendChild(script);

            this.sidebarInjected = true;
            
            // Verify the sidebar was created
            const finalSidebar = document.getElementById('verdiqt-sidebar');
            console.log('Verdiqt: Final sidebar check:', !!finalSidebar);
            
            if (finalSidebar) {
                console.log('Verdiqt: Sidebar ready!');
                return finalSidebar;
            } else {
                console.error('Verdiqt: Sidebar injection failed - element not found after injection');
                return null;
            }
            
        } catch (error) {
            console.error('Verdiqt: Failed to inject sidebar:', error);
            return null;
        }
    }

    scrapeReviews() {
        try {
            console.log('Verdiqt: Scraping reviews...');
            const reviews = [];
            let reviewElements = [];

            // Try multiple selectors for Amazon review text (more comprehensive)
            const selectors = [
                // Main review text selectors
                '[data-hook="review-body"] span:not([class])',  // Review body without classes
                '[data-hook="review-body"] .cr-original-review-text',  // Original review text
                '[data-hook="review-body"] > span',  // Direct span children
                '.review-text-content span',  // Alternative review text
                '.a-size-base.review-text',  // Base review text
                '.cr-original-review-text',  // Original review text class
                // Fallback selectors
                '[data-hook="review-body"]',  // Entire review body
                '.review-text'  // Generic review text
            ];

            // Try each selector until we find reviews
            for (const selector of selectors) {
                reviewElements = document.querySelectorAll(selector);
                console.log(`Verdiqt: Trying selector "${selector}" - found ${reviewElements.length} elements`);
                
                if (reviewElements.length > 0) {
                    // Filter elements to get actual text content
                    const textElements = Array.from(reviewElements).filter(el => {
                        const text = el.innerText?.trim();
                        return text && 
                               text.length >= 10 && 
                               !text.includes('Read more') && 
                               !text.includes('Helpful') &&
                               !text.includes('Report') &&
                               !text.match(/^\d+\s*(people|person)/); // Skip "X people found this helpful"
                    });
                    
                    if (textElements.length > 0) {
                        reviewElements = textElements;
                        console.log(`Verdiqt: Using selector: ${selector} (${reviewElements.length} valid reviews)`);
                        break;
                    }
                }
            }

            // If no Amazon reviews found, try Flipkart
            if (reviewElements.length === 0) {
                const flipkartSelectors = [
                    '._6K-7Co',
                    '.t-ZTKy',
                    '._11pzQk'
                ];
                
                for (const selector of flipkartSelectors) {
                    reviewElements = document.querySelectorAll(selector);
                    if (reviewElements.length > 0) {
                        console.log('Verdiqt: Using Flipkart selector:', selector);
                        break;
                    }
                }
            }

            // Extract text from elements
            reviewElements.forEach((element, index) => {
                if (index >= 20) return; // Max 20 reviews
                
                let text = element.innerText?.trim();
                
                // Clean up the text
                if (text) {
                    // Remove common Amazon review artifacts
                    text = text.replace(/Read more/g, '');
                    text = text.replace(/\n+/g, ' ');
                    text = text.replace(/\s+/g, ' ');
                    text = text.trim();
                    
                    if (text.length >= 10) { // Filter out very short text
                        reviews.push(text);
                    }
                }
            });

            console.log(`Verdiqt: Found ${reviews.length} reviews`);
            
            // Log first few reviews for debugging
            if (reviews.length > 0) {
                console.log('Verdiqt: Sample reviews:', reviews.slice(0, 3).map(r => r.substring(0, 100) + '...'));
            }
            
            return reviews;
        } catch (error) {
            console.error('Verdiqt: Error scraping reviews:', error);
            return [];
        }
    }

    injectBadges(results) {
        try {
            console.log('Verdiqt: Injecting badges...');
            
            // Remove existing badges first
            document.querySelectorAll('.verdiqt-badge').forEach(badge => badge.remove());

            // Use the same logic as scraping to find review elements
            let reviewElements = [];
            
            // Try the same selectors as scraping
            const selectors = [
                '[data-hook="review-body"] span:not([class])',
                '[data-hook="review-body"] .cr-original-review-text',
                '[data-hook="review-body"] > span',
                '.review-text-content span',
                '.a-size-base.review-text',
                '.cr-original-review-text',
                '[data-hook="review-body"]',
                '.review-text'
            ];

            // Try each selector until we find reviews
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                console.log(`Verdiqt: Badge injection trying selector "${selector}" - found ${elements.length} elements`);
                
                if (elements.length > 0) {
                    // Filter elements the same way as scraping
                    const textElements = Array.from(elements).filter(el => {
                        const text = el.innerText?.trim();
                        return text && 
                               text.length >= 10 && 
                               !text.includes('Read more') && 
                               !text.includes('Helpful') &&
                               !text.includes('Report') &&
                               !text.match(/^\d+\s*(people|person)/);
                    });
                    
                    if (textElements.length > 0) {
                        reviewElements = textElements;
                        console.log(`Verdiqt: Using selector for badges: ${selector} (${reviewElements.length} elements)`);
                        break;
                    }
                }
            }

            // If no Amazon reviews found, try Flipkart
            if (reviewElements.length === 0) {
                const flipkartSelectors = ['._6K-7Co', '.t-ZTKy', '._11pzQk'];
                for (const selector of flipkartSelectors) {
                    reviewElements = document.querySelectorAll(selector);
                    if (reviewElements.length > 0) break;
                }
            }

            console.log(`Verdiqt: Found ${reviewElements.length} review elements for badge injection`);
            console.log(`Verdiqt: Have ${results.length} sentiment results`);

            // Inject badges for each review
            results.forEach((result, index) => {
                if (index < reviewElements.length) {
                    const reviewElement = reviewElements[index];
                    
                    // Check if badge already exists
                    const existingBadge = reviewElement.parentNode.querySelector('.verdiqt-badge');
                    if (existingBadge) {
                        existingBadge.remove();
                    }
                    
                    const badge = document.createElement('span');
                    badge.className = 'verdiqt-badge';
                    badge.style.cssText = `
                        display: inline-block;
                        margin-left: 10px;
                        margin-right: 5px;
                        padding: 4px 12px;
                        border-radius: 999px;
                        font-size: 11px;
                        font-weight: 600;
                        color: white;
                        background: ${result.sentiment === 'positive' ? '#22C55E' : result.sentiment === 'negative' ? '#EF4444' : '#F59E0B'};
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        vertical-align: middle;
                        z-index: 1000;
                        position: relative;
                    `;
                    
                    const icon = result.sentiment === 'positive' ? '✅' : result.sentiment === 'negative' ? '❌' : '😐';
                    const text = result.sentiment === 'positive' ? 'Positive' : result.sentiment === 'negative' ? 'Negative' : 'Neutral';
                    badge.innerHTML = `${icon} ${text}`;
                    
                    // Try different insertion strategies
                    try {
                        // Strategy 1: Insert after the review element
                        if (reviewElement.nextSibling) {
                            reviewElement.parentNode.insertBefore(badge, reviewElement.nextSibling);
                        } else {
                            reviewElement.parentNode.appendChild(badge);
                        }
                    } catch (e) {
                        try {
                            // Strategy 2: Append to the review element itself
                            reviewElement.appendChild(badge);
                        } catch (e2) {
                            console.warn('Verdiqt: Could not inject badge for review', index, e2);
                        }
                    }
                }
            });

            console.log(`Verdiqt: Injected ${Math.min(results.length, reviewElements.length)} sentiment badges`);
        } catch (error) {
            console.error('Verdiqt: Error injecting badges:', error);
        }
    }

    setupMessageListener() {
        // Listen for messages from sidebar via window.postMessage
        window.addEventListener("message", (event) => {
            if (event.data.source === "VERDIQT_SIDEBAR") {
                if (event.data.action === "SCRAPE_REVIEWS") {
                    const reviews = this.scrapeReviews();
                    // Send response back to sidebar
                    window.postMessage({ 
                        source: "VERDIQT_CONTENT", 
                        action: "REVIEWS_DATA", 
                        reviews: reviews 
                    }, "*");
                } else if (event.data.action === "INJECT_BADGES") {
                    this.injectBadges(event.data.results);
                } else if (event.data.action === "HIDE_SIDEBAR") {
                    this.sidebarVisible = false;
                    const sidebar = document.getElementById('verdiqt-sidebar');
                    if (sidebar) {
                        sidebar.classList.remove('visible');
                    }
                }
            }
        });
    }
}

// Initialize content script
new VerdiqtContent();