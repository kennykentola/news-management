import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import pandas as pd

# Create a small dummy dataset to ensure model.pkl exists
data = {
    'text': [
        'Breaking news: Aliens land on earth and offer free pizza',
        'Official report confirms economy is growing steadily',
        'Shocking secret doctors dont want you to know',
        'Local community center opens new wing for arts',
        'You will not believe what this celebrity did',
        'Government announces new budget for infrastructure'
    ],
    'label': ['FAKE', 'REAL', 'FAKE', 'REAL', 'FAKE', 'REAL'] # 1=FAKE, 0=REAL
}

df = pd.DataFrame(data)

print("Training dummy model...")
vectorizer = TfidfVectorizer(stop_words='english')
X = vectorizer.fit_transform(df['text'])
y = df['label']

model = MultinomialNB()
model.fit(X, y)

MODEL_FILE = 'model.pkl'
print(f"Saving to {MODEL_FILE}...")
joblib.dump((model, vectorizer), MODEL_FILE)
print("Dummy model created successfully.")
