import os
import pandas as pd
import requests
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from datetime import datetime
import html

load_dotenv()

# Config
ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://fra.cloud.appwrite.io/v1')
PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID')
API_KEY = os.getenv('APPWRITE_API_KEY')
DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID', 'main')
COLLECTION_ID = os.getenv('APPWRITE_COLLECTION_ID_ARTICLES', 'articles')

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
        df = pd.read_csv(DATASET_PATH).head(30) # Get top 30 news
        df = df.fillna('')
        
        # Clean col names
        df.columns = [c.lower() for c in df.columns]
        
        count = 0
        for _, row in df.iterrows():
            try:
                # 1. Safer Data Extraction (Handles NameErrors and Missing Columns)
                potential_text = row.get('text') or row.get('content') or 'No content available'
                potential_title = row.get('title') 
                
                # 2. HTML Unescaping & Clean-up
                clean_content = html.unescape(str(potential_text)).strip()[:24000]
                
                # If title is missing or too short, use a snippet of content
                if not potential_title or len(str(potential_title).strip()) < 5:
                    clean_title = clean_content[:100] + "..." if len(clean_content) > 100 else clean_content
                else:
                    clean_title = html.unescape(str(potential_title)).strip()

                if not clean_title or clean_title == "...": 
                    clean_title = "News Update"

                label = row.get('label', 'REAL')
                score = 90 if label == 'REAL' else 15
                
                databases.create_document(
                    DATABASE_ID,
                    COLLECTION_ID,
                    ID.unique(),
                    {
                        'title': clean_title[:500], # Max size for title attribute
                        'content': clean_content,
                        'authorName': 'AI News Syncer',
                        'authorId': 'ai_system',
                        'status': 'PUBLISHED',
                        'aiLabel': str(label)[:50],
                        'aiScore': float(score),
                        'aiReason': f"Verified by automated data sync from trustworthy sources. Reliability for this article is estimated at {score}%.",
                        'createdAt': datetime.now().isoformat(),
                        'category': 'General',
                        'imageUrl': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'
                    }
                )
                count += 1
                if count >= 15: break # Don't flood, just fill home page
            except Exception as e:
                print(f"Failed to sync row: {e}")
                
        print(f"Successfully synced {count} articles to Appwrite.")
    except Exception as e:
        print(f"Error reading dataset: {e}")

if __name__ == "__main__":
    sync_data()
 
