import pandas as pd
import requests
from bs4 import BeautifulSoup
import os
from datetime import datetime

OUTPUT = 'dataset.csv'

def scrape_full_article(url):
    """
    High-Fidelity Scraper: Visits the source URL to extract the full manuscript and primary imagery.
    """
    try:
        response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NewsGuardBot/4.2'})
        if response.status_code != 200: return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 1. Neural Metadata Extraction (Meta Tags)
        image_url = None
        og_image = soup.find("meta", property="og:image")
        if og_image: image_url = og_image["content"]
        
        # 2. Manuscript Extraction Logic
        # Target common news containers
        article_body = []
        
        # Try finding the largest text container or standard article tags
        main_content = soup.find('article') or soup.find('main') or soup.find('div', class_='article-content') or soup.find('div', class_='content')
        
        if main_content:
            paragraphs = main_content.find_all('p')
            for p in paragraphs:
                if len(p.text.strip()) > 30:
                    article_body.append(p.text.strip())
        
        # Fallback to aggressive paragraph collection if no primary container found or content is thin
        if not article_body or len("\n".join(article_body)) < 250:
            article_body = [] # Clear thin content for total scan
            paragraphs = soup.find_all('p')
            for p in paragraphs:
                text = p.get_text().strip()
                # Filter out short snippets, social sharing text, and copyright footers
                if len(text) > 45 and not text.lower().startswith('copyright') and not text.startswith('All rights'):
                    article_body.append(text)

        full_content = "\n\n".join(article_body)
        
        return {
            'content': full_content if len(full_content) > 100 else None,
            'image_url': image_url
        }
    except Exception as e:
        print(f"Neural Extraction Error for {url}: {e}")
        return None

def fetch_google_news_nigeria():
    """
    Fetches the latest Nigerian news and performs deep-scan manuscript extraction.
    """
    today = datetime.now().strftime('%Y-%m-%d')
    print(f"Initiating High-Fidelity Nigerian Social Sync for {today}...")
    data = []
    
    query = f"Nigeria+news+breaking+{today}"
    url = f"https://news.google.com/rss/search?q={query}&hl=en-NG&gl=NG&ceid=NG:en"
    
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, features="xml")
        items = soup.find_all('item')
        
        for item in items[:15]: # Scrape top 15 deeply
            title_tag = item.find('title')
            link_tag = item.find('link')
            
            title = title_tag.text if title_tag else "No Title"
            link = link_tag.text if link_tag else "#"
            
            print(f"Deep Scanning: {title[:50]}...")
            deep_data = scrape_full_article(link)
            
            data.append({
                'title': title,
                'text': deep_data['content'] if deep_data and deep_data['content'] else title,
                'link': link,
                'image_url': deep_data['image_url'] if deep_data else None,
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
        combined = pd.concat([existing_df, new_df]).drop_duplicates(subset=['link'])
    else:
        combined = new_df
        
    combined.to_csv(OUTPUT, index=False)
    print(f"Added {len(new_df)} social trend items to {OUTPUT}")

if __name__ == "__main__":
    main()
