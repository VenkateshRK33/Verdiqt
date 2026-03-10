# FastAPI backend for Verdiqt Chrome extension with sentiment analysis
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from typing import List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load sentiment analysis model once on startup
try:
    sentiment_pipeline = pipeline(
        "sentiment-analysis",
        model="cardiffnlp/twitter-xlm-roberta-base-sentiment",
        return_all_scores=True
    )
    logger.info("Sentiment analysis model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load sentiment model: {e}")
    sentiment_pipeline = None

class ReviewsInput(BaseModel):
    reviews: List[str]

class ReviewResult(BaseModel):
    text: str
    sentiment: str
    confidence: float

class AnalysisResponse(BaseModel):
    reviews: List[ReviewResult]
    overall: dict

@app.get("/health")
def health_check():
    models_loaded = sentiment_pipeline is not None
    return {"status": "ok", "models_loaded": models_loaded}

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_reviews(input_data: ReviewsInput):
    print(f"Received analyze request with {len(input_data.reviews)} reviews")
    
    try:
        if sentiment_pipeline is None:
            raise HTTPException(status_code=500, detail="Sentiment analysis model not available")
        
        results = []
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
        
        for review_text in input_data.reviews:
            try:
                # Get sentiment predictions
                predictions = sentiment_pipeline(review_text)
                
                # The model returns [{'label': 'positive', 'score': 0.93}] format
                best_prediction = predictions[0]  # First (and only) result
                
                # Map model labels to our format (this model returns direct labels)
                sentiment = best_prediction['label'].lower()
                confidence = round(best_prediction['score'] * 100, 1)
                
                results.append(ReviewResult(
                    text=review_text,
                    sentiment=sentiment,
                    confidence=confidence
                ))
                
                sentiment_counts[sentiment] += 1
                
            except Exception as e:
                logger.error(f"Error processing review: {e}")
                # Default to neutral if processing fails
                results.append(ReviewResult(
                    text=review_text,
                    sentiment="neutral",
                    confidence=0.0
                ))
                sentiment_counts["neutral"] += 1
        
        # Calculate overall percentages
        total_reviews = len(input_data.reviews)
        overall = {
            "positive": round((sentiment_counts["positive"] / total_reviews) * 100) if total_reviews > 0 else 0,
            "negative": round((sentiment_counts["negative"] / total_reviews) * 100) if total_reviews > 0 else 0,
            "neutral": round((sentiment_counts["neutral"] / total_reviews) * 100) if total_reviews > 0 else 0
        }
        
        return AnalysisResponse(reviews=results, overall=overall)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in analyze_reviews: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")