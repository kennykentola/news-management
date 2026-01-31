import pandas as pd
import requests
import os
import io

OUTPUT_FILE = 'dataset.csv'

# Direct Parquet URLs (obtained from HF file tree)
URLS = {
    'train': 'https://huggingface.co/datasets/GonzaloA/fake_news/resolve/main/data/train-00000-of-00001.parquet',
    'validation': 'https://huggingface.co/datasets/GonzaloA/fake_news/resolve/main/data/validation-00000-of-00001.parquet',
    'test': 'https://huggingface.co/datasets/GonzaloA/fake_news/resolve/main/data/test-00000-of-00001.parquet'
}

def download_parquet(url):
    print(f"Downloading {url}...")
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        # Read parquet from bytes
        return pd.read_parquet(io.BytesIO(response.content))
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return pd.DataFrame()

def ingest_hf_data():
    print("Fetching 'GonzaloA/fake_news' via direct download...")
    
    dfs = []
    for split, url in URLS.items():
        df = download_parquet(url)
        if not df.empty:
            print(f"Loaded {split} with {len(df)} rows.")
            dfs.append(df)
            
    if not dfs:
        print("No data fetched.")
        return

    # Concatenate
    new_data = pd.concat(dfs, ignore_index=True)
    print(f"Total fetched from HuggingFace: {len(new_data)} rows.")
    
    # Map labels: HF (0=Fake, 1=Real) -> Strings ('FAKE', 'REAL')
    def map_hf_label(x):
        try:
            val = int(x)
            if val == 0: return 'FAKE'
            if val == 1: return 'REAL'
        except:
            pass
        return 'UNKNOWN'

    if 'label' in new_data.columns:
        new_data['label'] = new_data['label'].apply(map_hf_label)
    
    # Text (combine title + text)
    if 'title' in new_data.columns and 'text' in new_data.columns:
        new_data['text'] = new_data['title'].fillna('') + " " + new_data['text'].fillna('')
    elif 'title' in new_data.columns:
        new_data['text'] = new_data['title']
        
    final_new_data = new_data[['text', 'label']]
    
    # Load existing
    combined_df = final_new_data
    if os.path.exists(OUTPUT_FILE):
        print(f"Loading existing {OUTPUT_FILE}...")
        try:
            existing_df = pd.read_csv(OUTPUT_FILE, on_bad_lines='skip', engine='python')
            
            # Ensure existing labels are strings too if needed, but clean_data can handle it.
            # Just append.
            combined_df = pd.concat([existing_df, final_new_data], ignore_index=True)
        except Exception as e:
            print(f"Error reading existing file: {e}. Starting fresh with new data.")

    print(f"Saving combined dataset with {len(combined_df)} rows to {OUTPUT_FILE}...")
    combined_df.to_csv(OUTPUT_FILE, index=False)
    print("Ingestion complete.")

if __name__ == "__main__":
    ingest_hf_data()

if __name__ == "__main__":
    ingest_hf_data()
