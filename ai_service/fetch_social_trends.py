import pandas as pd
import requests
from bs4 import BeautifulSoup
import os
from datetime import datetime

OUTPUT = 'dataset.csv'

def scrape_full_article(url):
    """
    High-Fidelity Deep Scraper: Follows redirect chains (Google News -> real article)
    and extracts the full manuscript and banner image from the actual source page.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        
        # Follow full redirect chain to reach the real news site
        session = requests.Session()
        response = session.get(url, timeout=15, headers=headers, allow_redirects=True)
        final_url = response.url
        print(f"  -> Resolved to: {final_url[:80]}")
        
        if response.status_code != 200:
            print(f"  -> HTTP {response.status_code}, skipping.")
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 1. Banner Image: Extract from Open Graph meta tag
        image_url = None
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            image_url = og_image["content"]
        
        # 2. Full Manuscript Extraction — try multiple common news site patterns
        article_body = []
        
        # Priority: standard <article> tag or known content divs
        container = (
            soup.find('article') or
            soup.find('div', class_=lambda c: c and any(k in c for k in ['article-body', 'article-content', 'story-body', 'post-content', 'entry-content', 'article__body'])) or
            soup.find('main')
        )
        
        if container:
            for p in container.find_all('p'):
                text = p.get_text(separator=' ').strip()
                if len(text) > 40:
                    article_body.append(text)
        
        # Fallback: scan all page paragraphs if container-based extraction failed or is thin
        if not article_body or len('\n'.join(article_body)) < 300:
            article_body = []
            for p in soup.find_all('p'):
                text = p.get_text(separator=' ').strip()
                if (len(text) > 50 and 
                    not text.lower().startswith('copyright') and 
                    not text.lower().startswith('all rights') and
                    not text.lower().startswith('sign up') and
                    not text.lower().startswith('subscribe')):
                    article_body.append(text)
        
        full_content = '\n\n'.join(article_body)
        print(f"  -> Extracted {len(full_content)} chars of content, image: {'YES' if image_url else 'NO'}")
        
        return {
            'content': full_content if len(full_content) > 150 else None,
            'image_url': image_url
        }
    except Exception as e:
        print(f"  -> Extraction error for {url[:60]}: {e}")
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
