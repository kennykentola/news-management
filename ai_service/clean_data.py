import pandas as pd
import re

INPUT_FILE = 'dataset.csv'
OUTPUT_FILE = 'dataset_cleaned.csv'

def clean_text(text):
    if not isinstance(text, str):
        return ""
    # Remove special characters but keep punctuation
    text = re.sub(r'[^\w\s.,!?]', '', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def clean_data():
    print(f"Reading {INPUT_FILE}...")
    try:
        # specific encoding and error handling for messy CSVs
        df = pd.read_csv(INPUT_FILE, encoding='utf-8', on_bad_lines='skip', engine='python')
    except Exception as e:
        print(f"Error reading file: {e}")
        try:
             print("Trying latin1 encoding...")
             df = pd.read_csv(INPUT_FILE, encoding='latin1', on_bad_lines='skip', engine='python')
        except Exception as e2:
             print(f"Failed to read file: {e2}")
             return

    initial_count = len(df)
    print(f"Loaded {initial_count} rows.")

    # 1. Standardize Column Names
    df.columns = [c.lower().strip() for c in df.columns]
    
    # Check for required columns
    text_col = next((c for c in df.columns if 'text' in c), None)
    label_col = next((c for c in df.columns if 'label' in c), None)
    
    if not text_col or not label_col:
        print(f"Error: Could not find 'text' and 'label' columns. Found: {df.columns}")
        return

    # 2. Fix Labels (Map to 0 and 1)
    # 0 = REAL, 1 = FAKE
    def fix_label(l):
        s = str(l).upper().strip()
        if 'FAKE' in s or '1' in s: return 1
        return 0 # Default to REAL if unsure, or you could drop it

    df['label_clean'] = df[label_col].apply(fix_label)

    # 3. Clean Text
    print("Cleaning text content...")
    df['text_clean'] = df[text_col].apply(clean_text)

    # 4. Remove Empty Rows
    df = df.dropna(subset=['text_clean'])
    df = df[df['text_clean'].str.len() > 50] # Remove very short texts

    # 5. Save Clean Version
    # We only keep the clean columns to keep it simple
    final_df = df[['text_clean', 'label_clean']]
    final_df.columns = ['text', 'label'] # Rename for training script
    
    removed = initial_count - len(final_df)
    print(f"Removed {removed} bad/empty rows.")
    print(f"Saving cleaned data to {OUTPUT_FILE}...")
    
    final_df.to_csv(OUTPUT_FILE, index=False)
    print("Done! You can now use 'dataset_cleaned.csv' for training.")

if __name__ == "__main__":
    clean_data()
