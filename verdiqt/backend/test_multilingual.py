# Debug script for multilingual sentiment analysis
import requests
import json

# Test reviews in different languages with known sentiments
test_reviews = [
    # English
    "This product is absolutely amazing and fantastic!",  # Should be positive
    "This is terrible quality, completely useless waste of money",  # Should be negative
    "It's okay, nothing special but works fine",  # Should be neutral
    
    # Hindi
    "यह बहुत बढ़िया प्रोडक्ट है, मुझे बहुत पसंद आया",  # Should be positive
    "यह बिल्कुल बेकार है, पैसे की बर्बादी",  # Should be negative
    "ठीक है, कुछ खास नहीं",  # Should be neutral
    
    # Simple test
    "Great!",  # Should be positive
    "Bad!",   # Should be negative
    "Okay."   # Should be neutral
]

def debug_backend():
    try:
        print("🔍 DEBUGGING Multilingual Sentiment Analysis Backend")
        print("=" * 70)
        
        # Test health endpoint
        print("1. Testing health endpoint...")
        try:
            health_response = requests.get('http://localhost:8000/health', timeout=5)
            health_data = health_response.json()
            print(f"   ✅ Health: {health_data}")
            
            if not health_data.get('models_loaded'):
                print("   ❌ Model not loaded! Backend issue detected.")
                return False
        except Exception as e:
            print(f"   ❌ Health check failed: {e}")
            return False
        
        print()
        
        # Test individual reviews
        print("2. Testing individual reviews...")
        print("-" * 50)
        
        for i, review in enumerate(test_reviews):
            print(f"\n🧪 Test {i+1}: {review[:50]}...")
            
            try:
                response = requests.post(
                    'http://localhost:8000/analyze',
                    json={'reviews': [review]},
                    timeout=10
                )
                
                if response.status_code != 200:
                    print(f"   ❌ HTTP {response.status_code}: {response.text}")
                    continue
                
                result = response.json()
                
                if 'reviews' in result and len(result['reviews']) > 0:
                    review_result = result['reviews'][0]
                    sentiment = review_result['sentiment']
                    confidence = review_result['confidence']
                    language = review_result.get('language', 'Unknown')
                    
                    sentiment_icon = "✅" if sentiment == "positive" else "❌" if sentiment == "negative" else "😐"
                    
                    print(f"   {sentiment_icon} Result: {sentiment.upper()} ({confidence}%) | 🌐 {language}")
                    
                    # Check if result makes sense
                    if confidence < 50:
                        print(f"   ⚠️  Low confidence detected!")
                    
                else:
                    print(f"   ❌ Invalid response format: {result}")
                    
            except Exception as e:
                print(f"   ❌ Request failed: {e}")
        
        print("\n" + "=" * 70)
        
        # Test batch analysis
        print("3. Testing batch analysis...")
        try:
            batch_response = requests.post(
                'http://localhost:8000/analyze',
                json={'reviews': test_reviews[:5]},  # Test first 5
                timeout=15
            )
            
            if batch_response.status_code == 200:
                batch_result = batch_response.json()
                print(f"   ✅ Batch analysis successful")
                print(f"   📊 Overall: {batch_result.get('overall', {})}")
                print(f"   🌐 Languages: {batch_result.get('languages_detected', [])}")
                
                # Check for all neutral issue
                sentiments = [r['sentiment'] for r in batch_result.get('reviews', [])]
                if all(s == 'neutral' for s in sentiments):
                    print("   🚨 ALL NEUTRAL ISSUE DETECTED!")
                    print("   This indicates a model configuration problem.")
                else:
                    print(f"   ✅ Sentiment variety: {set(sentiments)}")
                    
            else:
                print(f"   ❌ Batch failed: HTTP {batch_response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Batch test failed: {e}")
        
        print("\n" + "=" * 70)
        print("4. Diagnosis Summary:")
        
        # Final diagnosis
        print("   Backend Status: ✅ Running")
        print("   Model Status: ✅ Loaded")
        print("   API Status: ✅ Responding")
        
        print("\n🎯 Next Steps:")
        print("   1. Restart backend: uvicorn main:app --reload")
        print("   2. Reload Chrome extension")
        print("   3. Test on any website with text content")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend!")
        print("\n🔧 To start backend:")
        print("   cd verdiqt/backend")
        print("   pip install langdetect")
        print("   uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"❌ Debug failed with error: {e}")
        return False

def test_language_detection():
    print("\n🌐 Testing Language Detection...")
    
    from langdetect import detect
    
    test_texts = {
        "This is English text": "en",
        "यह हिंदी टेक्स्ट है": "hi", 
        "இது தமிழ் உரை": "ta",
        "ఇది తెలుగు వచనం": "te"
    }
    
    for text, expected in test_texts.items():
        try:
            detected = detect(text)
            status = "✅" if detected == expected else "❌"
            print(f"   {status} '{text[:20]}...' -> {detected} (expected: {expected})")
        except Exception as e:
            print(f"   ❌ '{text[:20]}...' -> Error: {e}")

if __name__ == "__main__":
    success = debug_backend()
    if success:
        test_language_detection()
    
    print("\n" + "="*70)
    print("🔍 Debug completed! Check the results above.")
    print("="*70)