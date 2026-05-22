import os
import time
import json
from dotenv import load_dotenv
from supabase import create_client, Client
from appwrite.client import Client as AppwriteClient
from appwrite.services.users import Users
from appwrite.services.databases import Databases
from appwrite.query import Query

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials missing in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Appwrite configuration
APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT", "https://fra.cloud.appwrite.io/v1")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")
DATABASE_ID = os.getenv("DATABASE_ID", "main")
COLLECTION_ARTICLES = os.getenv("COLLECTION_ID_ARTICLES", "articles")

if not APPWRITE_PROJECT_ID or not APPWRITE_API_KEY:
    print("Error: Appwrite credentials missing in .env. Ensure APPWRITE_PROJECT_ID and APPWRITE_API_KEY are set.")
    exit(1)

# Initialize Appwrite Server Client
appwrite_client = AppwriteClient()
appwrite_client.set_endpoint(APPWRITE_ENDPOINT)
appwrite_client.set_project(APPWRITE_PROJECT_ID)
appwrite_client.set_key(APPWRITE_API_KEY)

users_service = Users(appwrite_client)
db_service = Databases(appwrite_client)

def backup_users():
    print("Starting User Backup...")
    try:
        total_migrated = 0
        offset = 0
        limit = 100
        
        while True:
            response = users_service.list(queries=[
                Query.limit(limit),
                Query.offset(offset)
            ])
            users_list = getattr(response, 'users', response.get('users', []) if isinstance(response, dict) else [])
            if not users_list:
                break
                
            for obj in users_list:
                u = obj if isinstance(obj, dict) else obj.to_dict() if hasattr(obj, 'to_dict') else vars(obj)
                data = {
                    "id": u.get('$id') or u.get('id'),
                    "name": u.get('name'),
                    "email": u.get('email'),
                    "password_hash": u.get('password', ''), # Password hash requires specific scope in API key
                    "registration": u.get('registration'),
                    "prefs": u.get('prefs', {})
                }
                supabase.table("appwrite_users_backup").upsert(data).execute()
                total_migrated += 1
            
            print(f"Backed up {total_migrated} users...")
            offset += limit
            
            # Simple rate limit prevention
            time.sleep(0.5)
            
        print(f"Success! Backed up {total_migrated} users to Supabase.")
    except Exception as e:
        print(f"Error backing up users: {e}")

def backup_articles():
    print("\nStarting Articles Backup...")
    try:
        total_migrated = 0
        offset = 0
        limit = 100
        
        while True:
            response = db_service.list_documents(
                database_id=DATABASE_ID,
                collection_id=COLLECTION_ARTICLES,
                queries=[
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            )
            docs_list = getattr(response, 'documents', response.get('documents', []) if isinstance(response, dict) else [])
            if not docs_list:
                break
                
            for obj in docs_list:
                d = obj if isinstance(obj, dict) else obj.to_dict() if hasattr(obj, 'to_dict') else vars(obj)
                data = {
                    "id": d.get('$id') or d.get('id'),
                    "title": d.get('title'),
                    "content": d.get('content'),
                    "author_id": d.get('authorId'),
                    "author_name": d.get('authorName'),
                    "status": d.get('status'),
                    "category": d.get('category'),
                    "image_url": d.get('imageUrl'),
                    "created_at": d.get('$createdAt') or d.get('createdAt'),
                    "ai_score": d.get('aiScore'),
                    "ai_label": d.get('aiLabel')
                }
                supabase.table("appwrite_articles_backup").upsert(data).execute()
                total_migrated += 1
            
            print(f"Backed up {total_migrated} articles...")
            offset += limit
            
            time.sleep(0.5)
            
        print(f"Success! Backed up {total_migrated} articles to Supabase.")
    except Exception as e:
        print(f"Error backing up articles: {e}")

if __name__ == "__main__":
    print("=== Appwrite to Supabase Cold Storage Backup ===")
    backup_users()
    backup_articles()
    print("=== Backup Complete ===")
