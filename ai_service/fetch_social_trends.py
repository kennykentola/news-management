import pandas as pd
import requests
from bs4 import BeautifulSoup
import os
from datetime import datetime

OUTPUT = 'dataset.csv'

def scrape_full_article(url):
    """
    High-Fidelity Deep Scraper: Follows redirect chains and extracts full manuscript
    and banner images. Uses aggressive headers to bypass 406 blocks.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://news.google.com/',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        session = requests.Session()
        response = session.get(url, timeout=15, headers=headers, allow_redirects=True)
        final_url = response.url
        
        if response.status_code != 200:
            print(f"  -> HTTP {response.status_code} for {final_url[:50]}")
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 1. Image Extraction (Multi-Tag Logic)
        image_url = None
        for prop in ["og:image", "twitter:image", "og:image:url"]:
            tag = soup.find("meta", property=prop) or soup.find("meta", attrs={"name": prop})
            if tag and tag.get("content"):
                image_url = tag["content"]
                break
        
        if not image_url:
            # Fallback to first large image
            for img in soup.find_all('img', src=True):
                if 'logo' not in img['src'].lower() and ('banner' in img['src'].lower() or 'article' in img['src'].lower()):
                    image_url = img['src']
                    break
        
        # 2. Content Extraction
        article_body = []
        container = (
            soup.find('article') or
            soup.find('div', class_=lambda c: c and any(k in c for k in ['article-body', 'article-content', 'story-body', 'post-content', 'entry-content', 'article__body', 'td-post-content'])) or
            soup.find('main')
        )
        
        if container:
            for p in container.find_all(['p', 'div']):
                if p.name == 'div' and p.find('p'): continue # Avoid double counting
                text = p.get_text(separator=' ').strip()
                if len(text) > 40 and not any(x in text.lower() for x in ['subscribe', 'cookie', 'javascript']):
                    article_body.append(text)
        
        full_content = '\n\n'.join(article_body)
        
        # 3. Fallback to Meta Description if body is thin
        if len(full_content) < 200:
            meta_desc = soup.find("meta", property="og:description") or soup.find("meta", attrs={"name": "description"})
            if meta_desc and meta_desc.get("content"):
                full_content = meta_desc["content"]
                print(f"  -> Falling back to meta description.")

        return {
            'content': full_content if len(full_content) > 50 else None,
            'image_url': image_url,
            'resolved_url': final_url
        }
    except Exception as e:
        print(f"  -> Extraction error: {e}")
        return None


def fetch_google_news_nigeria():
    """
    Fetches latest Nigerian news and deep-scans the REAL article URLs.
    """
    today = datetime.now().strftime('%Y-%m-%d')
    print(f"Initiating High-Fidelity Nigerian Social Sync for {today}...")
    data = []
    
    query = f"Nigeria+news+breaking+{today}"
    rss_url = f"https://news.google.com/rss/search?q={query}&hl=en-NG&gl=NG&ceid=NG:en"
    
    try:
        response = requests.get(rss_url, timeout=30)
        soup = BeautifulSoup(response.content, features="xml")
        items = soup.find_all('item')[:10] # Reduced to top 10 for speed
        
        for item in items:
            title = item.find('title').text.strip() if item.find('title') else "No Title"
            google_link = item.find('link').text.strip() if item.find('link') else "#"
            
            print(f"Scanning: {title[:60]}...")
            deep_data = scrape_full_article(google_link)
            
            # Content fallback: if deep data fails, use the title but mark as unverified
            content = deep_data['content'] if deep_data and deep_data['content'] else title
            image = deep_data['image_url'] if deep_data and deep_data['image_url'] else None
            
            data.append({
                'title': title,
                'text': content,
                'link': deep_data['resolved_url'] if deep_data else google_link,
                'image_url': image,
                'label': 'UNVERIFIED',
                'source': 'Social/RSS',
                'language': 'English'
            })
            
        return data
    except Exception as e:
        print(f"Error fetching RSS: {e}")
        return []

def main():
    social_data = fetch_google_news_nigeria()
    
    if not social_data:
        print("No new social data found.")
        return

    new_df = pd.DataFrame(social_data)
    
    if os.path.exists(OUTPUT):
        try:
            existing_df = pd.read_csv(OUTPUT)
            combined = pd.concat([existing_df, new_df]).drop_duplicates(subset=['link'], keep='last')
        except:
            combined = new_df
    else:
        combined = new_df
        
    combined.to_csv(OUTPUT, index=False)
    print(f"Added {len(new_df)} social trend items to {OUTPUT}")

if __name__ == "__main__":
    main()
