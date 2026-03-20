import pandas as pd
import requests
from bs4 import BeautifulSoup
import os
from datetime import datetime

OUTPUT = 'dataset.csv'

def fetch_google_news_nigeria():
    """
    Simulates fetching Nigerian news trends that are popular on X/Facebook 
    by searching for 'Nigeria' in Google News and filtering for viral topics.
    """
    print("Fetching Nigerian Social Trends from News Aggregators...")
    data = []
    
    # Using Google News RSS for Nigeria
    url = "https://news.google.com/rss/search?q=Nigeria+trending+social+media&hl=en-NG&gl=NG&ceid=NG:en"
    
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, features="xml")
        items = soup.find_all('item')
        
        for item in items[:20]:
            title = item.title.text
            link = item.link.text
            pub_date = item.pubDate.text
            
            # Simple simulation: assume trending news might be misinformation to be checked
            # This is where you would normally use an AI to classify or manually label
            data.append({
                'text': title,
                'label': 0, # Default to 0 (Unverified/Potential Fake) for training purposes
                'source': 'Social/RSS',
                'language': 'English' # Could be expanded to Yoruba/Igbo/Hausa searches
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
        combined = pd.concat([existing_df, new_df]).drop_duplicates(subset=['text'])
    else:
        combined = new_df
        
    combined.to_csv(OUTPUT, index=False)
    print(f"Added {len(new_df)} social trend items to {OUTPUT}")

if __name__ == "__main__":
    main()
