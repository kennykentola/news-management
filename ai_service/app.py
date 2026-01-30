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
            '/detect': 'POST - {text: string}'
        }
    })

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
            
            return jsonify({
                'result': prediction,
                'score': round(reliability_score, 2)
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
