import pandas as pd
import requests
from bs4 import BeautifulSoup
import os
import json

# TARGETS: Africa Check, Dubawa
AFRICA_CHECK_BASE = "https://africacheck.org/fact-checks?page="
DUBAWA_BASE = "https://dubawa.org/all-fact-checks/page/"

def fetch_africa_check(pages=5):
    print(f"Fetching Africa Check data (approx {pages} pages)...")
    results = []
    try:
        for i in range(pages):
            url = f"{AFRICA_CHECK_BASE}{i}"
            res = requests.get(url, timeout=10)
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Africa Check articles usually have a specific structure
            articles = soup.find_all('article')
            for art in articles:
                title = art.find('h3')
                if title:
                    # Check the meta data for label (Africa Check uses specific patterns)
                    label = art.find('div', class_='field--name-field-rating')
                    label_text = label.text.strip().upper() if label else "UNKNOWN"
                    
                    # Map to FAKE/REAL
                    final_label = 'FAKE' if any(word in label_text for word in ['FALSE', 'INCORRECT', 'MISLEADING', 'EXAGGERATED']) else 'REAL'
                    
                    results.append({
                        'text': title.text.strip(),
                        'label': final_label,
                        'source': 'Africa Check'
                    })
        return results
    except Exception as e:
        print(f"Error fetching Africa Check: {e}")
        return []

def fetch_dubawa(pages=5):
    print(f"Fetching Dubawa data (approx {pages} pages)...")
    results = []
    try:
        for i in range(1, pages + 1):
            url = f"{DUBAWA_BASE}{i}"
            res = requests.get(url, timeout=10)
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Dubawa structure
            titles = soup.find_all('h3', class_='elementor-post__title')
            for t in titles:
                results.append({
                    'text': t.text.strip(),
                    'label': 'FAKE', # Most things on Dubawa are fact-checks of false info
                    'source': 'Dubawa'
                })
        return results
    except Exception as e:
        print(f"Error fetching Dubawa: {e}")
        return []

def run_ingest():
    data = []
    data.extend(fetch_africa_check(3))
    data.extend(fetch_dubawa(3))
    
    if not data:
        print("No new data fetched.")
        return

    new_df = pd.DataFrame(data)
    OUTPUT = 'dataset.csv'
    
    if os.path.exists(OUTPUT):
        existing = pd.read_csv(OUTPUT)
        combined = pd.concat([existing, new_df], ignore_index=True)
        combined = combined.drop_duplicates(subset=['text'])
        combined.to_csv(OUTPUT, index=False)
    else:
        new_df.to_csv(OUTPUT, index=False)
        
    print(f"Successfully added {len(new_df)} new African fact-checks to dataset.csv")

if __name__ == "__main__":
    run_ingest()
