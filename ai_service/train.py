import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import PassiveAggressiveClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# CONFIG
DATASET_PATH = 'dataset.csv' 
MODEL_PATH = 'model.pkl'

def train_model():
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}.")
        return

    print("Loading dataset...")
    try:
        try:
             df = pd.read_csv(DATASET_PATH, encoding='utf-8', on_bad_lines='skip', engine='python')
        except:
             df = pd.read_csv(DATASET_PATH, encoding='latin1', on_bad_lines='skip', engine='python')
        
        # Normalize column names
        df.columns = [c.lower().strip() for c in df.columns]
        
        # Identify text and label columns
        text_col = next((c for c in df.columns if 'text' in c or 'title' in c or 'news' in c), None)
        label_col = next((c for c in df.columns if 'label' in c or 'class' in c or 'target' in c), None)
        
        if not text_col or not label_col:
             print(f"Could not automatically identify 'text' and 'label' columns in {df.columns}. Please rename columns.")
             return
             
        print(f"Using columns: Text='{text_col}', Label='{label_col}'")

        # Drop NaNs
        df = df.dropna(subset=[text_col, label_col])
        
        X = df[text_col]
        y = df[label_col] 
        
        print(f"Training on {len(df)} samples...")
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Vectorization
        vectorizer = TfidfVectorizer(stop_words='english', max_df=0.7)
        tfidf_train = vectorizer.fit_transform(X_train.astype(str)) 
        tfidf_test = vectorizer.transform(X_test.astype(str))
        
        # Model: Naive Bayes (Fast & supports predict_proba)
        # Check if we should use PassiveAggressive (better for large text) or NB
        # NB is safer for small datasets and supports predict_proba naturally
        nb = MultinomialNB()
        nb.fit(tfidf_train, y_train)
        
        # Benchmark
        y_pred = nb.predict(tfidf_test)
        score = accuracy_score(y_test, y_pred)
        print(f'Accuracy: {score*100:.2f}%')
        
        # Save
        joblib.dump((nb, vectorizer), MODEL_PATH)
        print(f"Model saved to {MODEL_PATH}")
        
    except Exception as e:
        print(f"Error during training: {e}")

if __name__ == '__main__':
    train_model()
