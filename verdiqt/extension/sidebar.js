// JavaScript for Verdiqt extension sidebar functionality
console.log('Verdiqt sidebar loaded');

class VerdiqtSidebar {
    constructor() {
        console.log('Verdiqt: Initializing sidebar class...');
        
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            this.initialize();
        }, 100);
    }

    initialize() {
        console.log('Verdiqt: Finding sidebar elements...');
        
        this.sidebar = document.getElementById('verdiqt-sidebar');
        this.loadingSection = document.getElementById('loading-section');
        this.resultsSection = document.getElementById('results-section');
        this.errorSection = document.getElementById('error-section');
        this.reviewsList = document.getElementById('reviews-list');
        
        console.log('Verdiqt: Sidebar element:', !!this.sidebar);
        console.log('Verdiqt: Loading section:', !!this.loadingSection);
        
        if (!this.sidebar || !this.loadingSection) {
            console.error('Verdiqt: Sidebar elements not found! Retrying...');
            setTimeout(() => this.initialize(), 200);
            return;
        }
        
        this.initEventListeners();
        this.setupMessageListener();
        
        // Start analysis automatically when sidebar opens
        console.log('Verdiqt: Starting automatic analysis...');
        this.loadAndAnalyze();
    }

    initEventListeners() {
        console.log('Verdiqt: Setting up event listeners...');
        
        const closeBtn = document.getElementById('close-sidebar');
        const reanalyzeBtn = document.getElementById('reanalyze-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideSidebar();
            });
        }

        if (reanalyzeBtn) {
            reanalyzeBtn.addEventListener('click', () => {
                this.loadAndAnalyze();
            });
        }
    }

    setupMessageListener() {
        console.log('Verdiqt: Setting up message listener...');
        
        // Listen for messages from content script
        window.addEventListener("message", (event) => {
            if (event.data.source === "VERDIQT_CONTENT") {
                console.log('Verdiqt: Received message from content:', event.data.action);
                
                if (event.data.action === "REVIEWS_DATA") {
                    this.handleReviewsData(event.data.reviews);
                }
            }
        });
    }

    showSection(sectionName) {
        console.log('Verdiqt: Showing section:', sectionName);
        
        // Hide all sections
        if (this.loadingSection) this.loadingSection.classList.add('hidden');
        if (this.resultsSection) this.resultsSection.classList.add('hidden');
        if (this.errorSection) this.errorSection.classList.add('hidden');

        // Show requested section
        switch(sectionName) {
            case 'loading':
                if (this.loadingSection) this.loadingSection.classList.remove('hidden');
                break;
            case 'results':
                if (this.resultsSection) this.resultsSection.classList.remove('hidden');
                break;
            case 'error':
                if (this.errorSection) this.errorSection.classList.remove('hidden');
                break;
        }
    }

    async loadAndAnalyze() {
        console.log('Verdiqt: Starting analysis...');
        this.showSection('loading');

        try {
            // Step 1: Request reviews from content script
            console.log('Verdiqt: Requesting reviews from content script...');
            await this.scrapeReviews();

        } catch (error) {
            console.error('Verdiqt: Analysis failed:', error);
            this.showError(error.message);
        }
    }

    async scrapeReviews() {
        return new Promise((resolve, reject) => {
            console.log('Verdiqt: Sending SCRAPE_REVIEWS message...');
            
            // Send message to content script to scrape reviews
            window.postMessage({ 
                source: "VERDIQT_SIDEBAR", 
                action: "SCRAPE_REVIEWS" 
            }, "*");

            // Set timeout for response
            const timeout = setTimeout(() => {
                console.error('Verdiqt: Timeout waiting for reviews');
                reject(new Error('Timeout waiting for reviews. Make sure you are on a product page with reviews.'));
            }, 10000);

            // Store resolve/reject for use in message handler
            this.scrapePromise = { resolve, reject, timeout };
        });
    }

    async handleReviewsData(reviews) {
        try {
            console.log('Verdiqt: Handling reviews data...');
            
            // Clear timeout
            if (this.scrapePromise?.timeout) {
                clearTimeout(this.scrapePromise.timeout);
            }

            console.log(`Verdiqt: Found ${reviews.length} reviews`);
            
            if (!reviews || reviews.length === 0) {
                this.showError('No reviews found on this page. Make sure you are on a product page with customer reviews.');
                return;
            }

            // Step 2: Analyze reviews with backend
            console.log('Verdiqt: Calling backend...');
            const analysisResult = await this.analyzeReviews(reviews);
            
            console.log('Verdiqt: Got results:', analysisResult);
            
            // Step 3: Show results in sidebar
            this.displayResults(analysisResult);
            this.showSection('results');

            // Step 4: Send results to content script for badge injection
            console.log('Verdiqt: Sending badge injection message...');
            window.postMessage({
                source: "VERDIQT_SIDEBAR",
                action: "INJECT_BADGES", 
                results: analysisResult.reviews
            }, "*");

            // Resolve the scrape promise
            if (this.scrapePromise?.resolve) {
                this.scrapePromise.resolve(reviews);
            }

        } catch (error) {
            console.error('Verdiqt: Error handling reviews data:', error);
            this.showError(error.message);
            
            if (this.scrapePromise?.reject) {
                this.scrapePromise.reject(error);
            }
        }
    }

    async analyzeReviews(reviews) {
        // Create AbortController for 30 second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            console.log('Verdiqt: Fetching from backend with', reviews.length, 'reviews');
            
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reviews }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Backend returned error. Make sure Verdiqt backend is running: cd backend && uvicorn main:app --reload');
            }

            const result = await response.json();
            console.log('Verdiqt: Backend response:', result);
            return result;
            
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Verdiqt: Backend error:', error);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to backend. Start it with: cd backend && uvicorn main:app --reload');
            }
            throw error;
        }
    }

    displayResults(data) {
        console.log('Verdiqt: Displaying results...');
        
        // Update overall stats
        const positivePercent = document.getElementById('positive-percent');
        const negativePercent = document.getElementById('negative-percent');
        const neutralPercent = document.getElementById('neutral-percent');
        
        if (positivePercent) positivePercent.textContent = `${data.overall.positive}%`;
        if (negativePercent) negativePercent.textContent = `${data.overall.negative}%`;
        if (neutralPercent) neutralPercent.textContent = `${data.overall.neutral}%`;

        // Show summary message instead of individual reviews
        if (this.reviewsList) {
            this.reviewsList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #CBD5E0;">
                    <p style="font-size: 16px; margin-bottom: 10px;">✅ Analysis Complete!</p>
                    <p style="font-size: 14px;">Analyzed ${data.reviews.length} reviews</p>
                    <p style="font-size: 12px; margin-top: 10px; opacity: 0.7;">Sentiment badges are now visible beside each review on the page</p>
                </div>
            `;
        }
    }

    renderReviews(reviews) {
        console.log('Verdiqt: Rendering', reviews.length, 'reviews');
        
        if (!this.reviewsList) {
            console.error('Verdiqt: Reviews list element not found');
            return;
        }
        
        this.reviewsList.innerHTML = '';

        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';

            const sentimentIcon = this.getSentimentIcon(review.sentiment);
            const sentimentText = review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1);

            reviewCard.innerHTML = `
                <div class="review-header">
                    <span class="sentiment-badge ${review.sentiment}">
                        ${sentimentIcon} ${sentimentText}
                    </span>
                </div>
                <div class="review-text">${review.text.substring(0, 200)}${review.text.length > 200 ? '...' : ''}</div>
                <div class="confidence">Confidence: ${review.confidence}%</div>
            `;

            this.reviewsList.appendChild(reviewCard);
        });
        
        console.log('Verdiqt: Reviews rendered successfully');
    }

    getSentimentIcon(sentiment) {
        switch(sentiment) {
            case 'positive': return '✅';
            case 'negative': return '❌';
            case 'neutral': return '😐';
            default: return '😐';
        }
    }

    showError(message) {
        console.log('Verdiqt: Showing error:', message);
        
        const errorText = document.getElementById('error-text');
        if (errorText) {
            errorText.textContent = message;
        }
        this.showSection('error');
    }

    hideSidebar() {
        console.log('Verdiqt: Hiding sidebar');
        
        if (this.sidebar) {
            this.sidebar.classList.remove('visible');
        }
        
        // Send message to content script to hide sidebar
        window.postMessage({
            source: "VERDIQT_SIDEBAR",
            action: "HIDE_SIDEBAR"
        }, "*");
    }

    showSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.add('visible');
        }
    }
}

// Initialize sidebar immediately (not waiting for DOMContentLoaded)
console.log('Verdiqt: Creating sidebar instance...');
new VerdiqtSidebar();