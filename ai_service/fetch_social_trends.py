import pandas as pd
import requests
from bs4 import BeautifulSoup
import os
from datetime import datetime

OUTPUT = 'dataset.csv'

def fetch_google_news_nigeria():
    """
    Fetches the latest Nigerian news trends using a temporal anchor for 2026.
    """
    today = datetime.now().strftime('%Y-%m-%d')
    print(f"Fetching Nigerian Social Trends for {today}...")
    data = []
    
    # High-Fidelity Search Query with Temporal Anchor
    query = f"Nigeria+news+breaking+{today}"
    url = f"https://news.google.com/rss/search?q={query}&hl=en-NG&gl=NG&ceid=NG:en"
    
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, features="xml")
        items = soup.find_all('item')
        
        for item in items[:20]:
            title_tag = item.find('title')
            link_tag = item.find('link')
            
            title = title_tag.text if title_tag else "No Title"
            link = link_tag.text if link_tag else "#"
            
            data.append({
                'title': title, # Splitting title and text for better schema alignment
                'text': title,
                'link': link,
                'label': 0, 
                'source': 'Social/RSS',
                'language': 'English'
            })
            
        return data
    except Exception as e:
        print(f"Error fetching: {e}")
        return []

def main():
    social_data = fetch_google_news_nigeria()
    
    if not social_data:
        print("No new social data found.")
        return

    new_df = pd.DataFrame(social_data)
    
    if os.path.exists(OUTPUT):
        existing_df = pd.read_csv(OUTPUT)
        # Deduplicate by link (Source URL) which is a much stronger anchor than title
        combined = pd.concat([existing_df, new_df]).drop_duplicates(subset=['link'])
    else:
        combined = new_df
        
    combined.to_csv(OUTPUT, index=False)
    print(f"Added {len(new_df)} social trend items to {OUTPUT}")

if __name__ == "__main__":
    main()
