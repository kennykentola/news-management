import pandas as pd
import re
import io
import os

def clean_news_data(file_content, filename):
    """
    Cleans news dataset for AI training.
    Supports CSV and Excel.
    """
    ext = os.path.splitext(filename)[1].lower()
    
    try:
        if ext == '.csv':
            df = pd.read_csv(io.BytesIO(file_content))
        elif ext in ['.xlsx', '.xls']:
            df = pd.read_excel(io.BytesIO(file_content))
        else:
            return None, "Unsupported file format. Please use CSV or Excel."
    except Exception as e:
        return None, f"Error reading file: {str(e)}"

    # 1. Standardize column names (lowercase, no spaces)
    df.columns = [col.strip().lower().replace(' ', '_') for col in df.columns]

    # 2. Check for required columns or try to find them
    text_cols = [col for col in df.columns if 'text' in col or 'content' in col or 'body' in col]
    label_cols = [col for col in df.columns if 'label' in col or 'target' in col or 'class' in col]

    if not text_cols:
        return None, "Could not find a 'text' or 'content' column."

    primary_text = text_cols[0]
    
    # 3. Drop rows with empty text
    before_count = len(df)
    df = df.dropna(subset=[primary_text])
    
    # 4. Remove duplicates
    df = df.drop_duplicates(subset=[primary_text])

    # 5. Text Cleaning Heuristics
    def advanced_clean(text):
        if not isinstance(text, str): return ""
        # Remove HTML tags
        text = re.sub(r'<[^>]*>', '', text)
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Keep Nigerian specific characters if any (already standard in UTF-8 usually)
        return text

    df[primary_text] = df[primary_text].apply(advanced_clean)

    # 6. Basic Label cleaning if exists
    if label_cols:
        primary_label = label_cols[0]
        df[primary_label] = df[primary_label].astype(str).str.upper().str.strip()
        # Map common labels to REAL/FAKE
        mapping = {
            'TRUE': 'REAL', 'FALSE': 'FAKE', 
            'FACT': 'REAL', 'HOAX': 'FAKE',
            '1': 'REAL', '0': 'FAKE',
            'VERIFIED': 'REAL', 'UNVERIFIED': 'FAKE'
        }
        df[primary_label] = df[primary_label].map(lambda x: mapping.get(x, x))

    after_count = len(df)
    
    # Convert back to CSV for download
    output = io.BytesIO()
    df.to_csv(output, index=False)
    output.seek(0)
    
    stats = {
        "rows_before": before_count,
        "rows_after": after_count,
        "removed": before_count - after_count,
        "columns_processed": list(df.columns)
    }
    
    return output, stats
