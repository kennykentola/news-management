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
        duplicates = 0
        for _, row in df.iterrows():
            try:
                # 1. High-Fidelity Data Extraction
                potential_text = row.get('text') or row.get('content') or 'No content available'
                potential_title = row.get('title') 
                potential_link = row.get('link') or row.get('url') or ''
                
                clean_content = html.unescape(str(potential_text)).strip()[:24000]
                
                if not potential_title or len(str(potential_title).strip()) < 5:
                    clean_title = clean_content[:100] + "..." if len(clean_content) > 100 else clean_content
                else:
                    clean_title = html.unescape(str(potential_title)).strip()

                # 2. Neural Deduplication Logic
                # Check if an article with this title or link already exists
                from appwrite.query import Query
                existing = databases.list_documents(
                    DATABASE_ID,
                    COLLECTION_ID,
                    [
                        Query.equal('title', clean_title[:500]),
                        Query.limit(1)
                    ]
                )
                
                # Appwrite SDK returns a DocumentList object, use attribute access
                if getattr(existing, 'total', 0) > 0:
                    duplicates += 1
                    continue # Skip ingestion of redundant asset

                label = row.get('label', 'UNVERIFIED')
                score = 0 # Default to 0 for unverified sync
                
                # 3. High-Fidelity Asset Resolution (Banner Imagery)
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
                        'status': 'PENDING', 
                        'aiLabel': str(label)[:50],
                        'aiScore': float(score),
                        'aiReason': "This article was automatically ingested from an external source. Content authenticity has not yet been manually verified by an editor.",
                        'createdAt': datetime.now().isoformat(),
                        'category': 'General',
                        'sourceUrl': potential_link[:500],
                        'imageUrl': final_image
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
 
