import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report
import os

DATA_FILE = 'dataset_cleaned.csv'
MODEL_FILE = 'model.pkl'

def train():
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found. Run clean_data.py first.")
        return

    print("Loading data...")
    df = pd.read_csv(DATA_FILE)
    
    # Ensure strings
    df['text'] = df['text'].astype(str)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(df['text'], df['label'], test_size=0.2, random_state=42)
    
    # Vectorize
    print("Vectorizing text...")
    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    # Train
    print("Training Naive Bayes model...")
    model = MultinomialNB()
    model.fit(X_train_tfidf, y_train)
    
    # Evaluate
    print("Evaluating...")
    y_pred = model.predict(X_test_tfidf)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc*100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # Save
    print(f"Saving model to {MODEL_FILE}...")
    joblib.dump((model, vectorizer), MODEL_FILE)
    print("Done!")

if __name__ == "__main__":
    train()
