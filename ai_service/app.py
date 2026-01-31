from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model if exists
MODEL_PATH = 'model.pkl'
model = None
vectorizer = None

# Ensure TextBlob corpora are downloaded
try:
    from textblob import TextBlob
    import nltk
    nltk.download('punkt', quiet=True)
    nltk.download('brown', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    print("TextBlob corpora checked/downloaded.")
except Exception as e:
    print(f"Warning: Failed to download TextBlob corpora: {e}")

def load_model():
    global model, vectorizer
    if os.path.exists(MODEL_PATH):
        try:
            model, vectorizer = joblib.load(MODEL_PATH)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")

load_model()

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'online',
        'message': 'Fake News Detection API is running.',
        'endpoints': {
            '/detect': 'POST - {text: string}',
            '/reload': 'POST - Reload model'
        }
    })

@app.route('/reload', methods=['POST'])
def reload_model_route():
    load_model()
    return jsonify({'status': 'Model reloaded successfully'})

@app.route('/detect', methods=['POST'])
def detect():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    if model and vectorizer:
        try:
            # Transform and predict
            tfidf_text = vectorizer.transform([text])
            
            # Predict class
            prediction = model.predict(tfidf_text)[0] # 'FAKE' or 'REAL'
            
            # Predict probability (Reliability Score)
            proba = model.predict_proba(tfidf_text)[0] 
            
            classes = model.classes_
            real_index = np.where(classes == 'REAL')[0]
            
            if len(real_index) > 0:
                reliability_score = proba[real_index[0]] * 100
            else:
                reliability_score = proba.max() * 100
                if prediction == 'FAKE':
                    reliability_score = 100 - reliability_score
            
            # --- Advanced Analysis (Explainable AI) ---
            from textblob import TextBlob
            blob = TextBlob(text)
            sentiment_polarity = blob.sentiment.polarity # -1 (Negative) to 1 (Positive)
            
            # Keyword Analysis
            trigger_words = ['shocking', 'revealed', 'you won\'t believe', 'miracle', 'secret', 'banned', 'exposed']
            found_triggers = [word for word in trigger_words if word in text.lower()]
            
            # Simple Source Check (basic heuristic if URL provided, though here we input text mostly)
            # We can mock this or check if text contains known unreliable domains
            
            # Generate Explanation
            explanation = []
            if prediction == 'FAKE':
                explanation.append("The article pattern matches known misinformation styles.")
                if abs(sentiment_polarity) > 0.5:
                    explanation.append(f"The text is highly {'positive' if sentiment_polarity > 0 else 'negative'} ({sentiment_polarity:.2f}), which often indicates bias.")
                if found_triggers:
                    explanation.append(f"It uses sensationalist clickbait words: {', '.join(found_triggers)}.")
            else:
                explanation.append("The content aligns with patterns found in reliable news sources.")
                if not found_triggers:
                    explanation.append("The language is relatively neutral and professional.")

            # Ensure types are native Python types for JSON serialization
            prediction_label = str(prediction)
            reliability_score_val = float(reliability_score)
            sentiment_val = float(sentiment_polarity)

            return jsonify({
                'result': prediction_label,
                'score': round(reliability_score_val, 2),
                'analysis': {
                    'sentiment': round(sentiment_val, 2),
                    'triggers': found_triggers,
                    'explanation': " ".join(explanation)
                }
            })
        except Exception as e:
             return jsonify({'error': str(e)}), 500
    
    return jsonify({
        'result': 'UNKNOWN',
        'score': 0.0,
        'message': 'Model not trained yet. Please run training script.'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
