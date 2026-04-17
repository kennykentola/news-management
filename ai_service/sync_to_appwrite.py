import os
import pandas as pd
import requests
import joblib
import numpy as np
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from datetime import datetime
import html
try:
    from textblob import TextBlob
except ImportError:
    TextBlob = None

load_dotenv()

# Config
ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://fra.cloud.appwrite.io/v1')
PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID')
API_KEY = os.getenv('APPWRITE_API_KEY')
DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID', 'main')
COLLECTION_ID = os.getenv('APPWRITE_COLLECTION_ID_ARTICLES', 'articles')

# Load AI Model
MODEL_PATH = 'model.pkl'
model = None
vectorizer = None

if os.path.exists(MODEL_PATH):
    try:
        print(f"Loading AI Model from {MODEL_PATH}...")
        model, vectorizer = joblib.load(MODEL_PATH)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load AI model: {e}")

def predict_news(text):
    """
    Analyzes news text using the trained model and returns high-fidelity metrics.
    """
    if not model or not vectorizer or not text:
        return 'UNVERIFIED', 50.0, "AI analysis skipped: Model or content missing."

    try:
        tfidf_text = vectorizer.transform([text])
        prediction = model.predict(tfidf_text)[0] # 'REAL' or 'FAKE' or [0, 1]
        proba = model.predict_proba(tfidf_text)[0]
        
        # Determine score based on 'REAL' probability
        classes = list(model.classes_)
        real_idx = classes.index('REAL') if 'REAL' in classes else (0 if classes[0] == 0 else -1)
        
        if real_idx != -1:
            reliability_score = proba[real_idx] * 100
        else:
            reliability_score = proba.max() * 100 # Fallback
            if str(prediction) == '1' or str(prediction).upper() == 'FAKE':
                reliability_score = 100 - reliability_score

        # Readable label
        label = 'REAL' if (str(prediction) == '0' or str(prediction).upper() == 'REAL') else 'FAKE'
        
        # Basic Reason generation
        reason = f"Automated analysis indicates this content aligns with {label.lower()} news patterns."
        if TextBlob:
            sentiment = TextBlob(text).sentiment.polarity
            if abs(sentiment) > 0.6:
                reason += f" High emotional bias detected (polarity: {sentiment:.2f})."
        
        return label, round(float(reliability_score), 2), reason
    except Exception as e:
        print(f"Prediction error: {e}")
        return 'UNVERIFIED', 50.0, f"Analysis failed: {e}"

def sync_data():
    if not PROJECT_ID or not API_KEY:
        print("Missing Appwrite credentials.")
        return

    client = Client()
    client.set_endpoint(ENDPOINT)
    client.set_project(PROJECT_ID)
    client.set_key(API_KEY)
    
    databases = Databases(client)

    DATASET_PATH = 'dataset.csv'
    if not os.path.exists(DATASET_PATH):
        print("dataset.csv not found.")
        return

    try:
        # User requested just 2 articles per sync
        df = pd.read_csv(DATASET_PATH).head(10) # Load 10, but we cap at 2 success
        df = df.fillna('')
        
        # Clean col names
        df.columns = [c.lower() for c in df.columns]
        
        count = 0
        duplicates = 0
        for _, row in df.iterrows():
            if count >= 2: break # Cap at 2 NEW articles as per user request

            try:
                # 1. High-Fidelity Data Extraction
                potential_text = row.get('text') or row.get('content') or row.get('title') or 'No content available'
                potential_title = row.get('title') 
                potential_link = row.get('link') or row.get('url') or ''
                
                clean_content = html.unescape(str(potential_text)).strip()[:24000]
                
                if not potential_title or len(str(potential_title).strip()) < 5:
                    clean_title = clean_content[:100] + "..." if len(clean_content) > 100 else clean_content
                else:
                    clean_title = html.unescape(str(potential_title)).strip()

                # 2. Neural Deduplication Logic
                from appwrite.query import Query
                existing = databases.list_documents(
                    DATABASE_ID,
                    COLLECTION_ID,
                    [
                        Query.equal('title', clean_title[:500]),
                        Query.limit(1)
                    ]
                )
                
                if getattr(existing, 'total', 0) > 0:
                    duplicates += 1
                    continue

                # 3. AI Verification (Live Analysis)
                ai_label, ai_score, ai_reason = predict_news(clean_content)
                
                # 4. Image Resolution
                scraped_image = row.get('image_url')
                default_banner = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'
                final_image = scraped_image if scraped_image and str(scraped_image).startswith('http') else default_banner

                databases.create_document(
                    DATABASE_ID,
                    COLLECTION_ID,
                    ID.unique(),
                    {
                        'title': clean_title[:500],
                        'content': clean_content,
                        'authorName': 'AI News Syncer',
                        'authorId': 'ai_system',
                        'status': 'PENDING', # Always PENDING as per user request
                        'aiLabel': ai_label,
                        'aiScore': ai_score,
                        'aiReason': ai_reason,
                        'createdAt': datetime.now().isoformat(),
                        'category': 'General',
                        'sourceUrl': potential_link[:500],
                        'imageUrl': final_image
                    }
                )
                count += 1
                print(f"  + Synced: {clean_title[:60]}... [AI: {ai_label} {ai_score}%]")
            except Exception as e:
                print(f"Failed to sync row: {e}")
                
        print(f"Successfully synced {count} new articles to Appwrite. (Duplicates skipped: {duplicates})")
    except Exception as e:
        print(f"Error reading dataset: {e}")

if __name__ == "__main__":
    sync_data()
 
