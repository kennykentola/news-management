from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from data_cleaner import clean_news_data
import joblib
import os
import json
import subprocess
import numpy as np
import psutil
import logging
import requests
from dotenv import load_dotenv
from functools import wraps

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '').strip()
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile').strip()
if "8192" in GROQ_MODEL:
    GROQ_MODEL = 'llama-3.3-70b-versatile'
GROQ_ENABLED = bool(GROQ_API_KEY)
GROQ_TEMPERATURE = 0.2

if GROQ_ENABLED:
    logger.info("Groq support enabled with model %s", GROQ_MODEL)

def run_ai_chat(prompt, temperature=0.7):
    if not GROQ_ENABLED:
        raise Exception("GROQ_API_KEY not configured")
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": 1500,
        "stream": False
    }
    response = requests.post(url, headers=headers, json=payload, timeout=45)
    response.raise_for_status()
    content = response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
    
    cleaned = content.strip()
    start_idx = cleaned.find('{')
    end_idx = cleaned.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
        cleaned = cleaned[start_idx:end_idx+1]
    else:
        if cleaned.startswith("```json"): cleaned = cleaned[7:]
        elif cleaned.startswith("```"): cleaned = cleaned[3:]
        if cleaned.endswith("```"): cleaned = cleaned[:-3]
    return cleaned.strip()

def log_memory_usage(stage):
    process = psutil.Process(os.getpid())
    mem_info = process.memory_info()
    logger.info(f"[{stage}] Memory Usage: {mem_info.rss / 1024 / 1024:.2f} MB")

app = Flask(__name__)
CORS(app)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('x-api-key')
        secret = os.getenv('API_SECRET_TOKEN')
        if not secret:
            return jsonify({'error': 'Server misconfigured: missing API_SECRET_TOKEN'}), 500
        if not token or token != secret:
            return jsonify({'error': 'Unauthorized access'}), 401
        return f(*args, **kwargs)
    return decorated


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
    log_memory_usage("Before Loading Model")
    if os.path.exists(MODEL_PATH):
        try:
            logger.info(f"Loading model from {MODEL_PATH}...")
            model, vectorizer = joblib.load(MODEL_PATH)
            logger.info("Model and Vectorizer loaded successfully.")
            log_memory_usage("After Loading Model")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
        else:
            logger.warning(f"Model file {MODEL_PATH} not found. Some endpoints may fail.")

load_model()

def run_ai_assessment(text):
    if not GROQ_ENABLED:
        return None

    prompt = f"""
You are NewsGuard AI, the advanced neural engine assisting a news verification system.
Review the text below and decide whether it is likely REAL, FAKE, or REQUIRES_REVIEW.
IMPORTANT: Never refer to yourself as Gemini. Always refer to yourself as NewsGuard AI or the neural engine.

Return JSON only with these fields:
- label: REAL, FAKE, or REQUIRES_REVIEW
- confidence: number from 0 to 100
- rationale: short explanation
- risk_signals: array of short strings
- recommendation: one short sentence for the editor

Text:
{text}
"""

    try:
        raw_text = run_ai_chat(prompt, GROQ_TEMPERATURE)
        parsed = json.loads(raw_text)
        parsed["confidence"] = float(parsed.get("confidence", 0))
        parsed["risk_signals"] = parsed.get("risk_signals", []) or []
        return parsed
    except Exception as e:
        logger.warning(f"Groq API request failed: {e}")
        return None

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
@require_auth
def reload_model_route():
    load_model()
    return jsonify({'status': 'Model reloaded successfully'})

@app.route('/detect', methods=['POST'])
@require_auth
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

            gemini_result = None
            gemini_label = None
            gemini_confidence = None
            gemini_rationale = None
            gemini_risk_signals = []
            gemini_recommendation = None

            try:
                gemini_result = run_ai_assessment(text)
            except Exception as e:
                logger.warning("AI assessment failed: %s", e)

            if gemini_result:
                gemini_label = str(gemini_result.get('label', '')).upper()
                gemini_confidence = float(gemini_result.get('confidence', 0))
                gemini_rationale = gemini_result.get('rationale', '')
                gemini_risk_signals = gemini_result.get('risk_signals', [])
                gemini_recommendation = gemini_result.get('recommendation', '')

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
            
            final_result = str(prediction)
            if gemini_label == 'REQUIRES_REVIEW':
                final_result = 'REVIEW'
            elif gemini_label in ('REAL', 'FAKE'):
                if gemini_label == prediction:
                    final_result = gemini_label
                    reliability_score = (reliability_score + gemini_confidence) / 2 if gemini_confidence is not None else reliability_score
                else:
                    final_result = 'REVIEW'

            if gemini_result and gemini_rationale:
                # Use ONLY the high-quality Gemini rationale if available
                explanation.append(gemini_rationale)
            else:
                # Fallback static heuristics
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
            prediction_label = str(final_result)
            reliability_score_val = float(reliability_score)
            sentiment_val = float(sentiment_polarity)

            return jsonify({
                'result': prediction_label,
                'score': round(reliability_score_val, 2),
                'gemini': gemini_result,
                'analysis': {
                    'sentiment': round(sentiment_val, 2),
                    'triggers': found_triggers,
                    'explanation': " ".join(explanation)
                }
            })
        except Exception as e:
             return jsonify({'error': str(e)}), 500
    
@app.route('/proofread', methods=['POST'])
@require_auth
def proofread():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        if not GROQ_ENABLED:
            return jsonify({'error': 'AI is disabled on the server.'}), 503

        prompt = f"""
You are the NewsGuard AI Proofreader, a professional editorial assistant for a high-quality news platform.
Review the following text for grammar, spelling, clarity, and tone.
Fix any errors and improve flow while preserving the original meaning.
IMPORTANT: Never refer to yourself as Gemini.

Return JSON only with these fields:
- corrected: the full corrected text
- has_changes: true if you made changes, false if the text was already perfect

Text:
{text}
"""
        try:
            raw_text = run_ai_chat(prompt, 0.2)
            if not raw_text:
                 return jsonify({'corrected': None})
                 
            parsed = json.loads(raw_text)
            if parsed.get("has_changes"):
                return jsonify({
                    'original': text,
                    'corrected': parsed.get("corrected"),
                    'message': 'Corrections suggested'
                })
            else:
                return jsonify({
                    'original': text,
                    'corrected': None,
                    'message': 'No corrections needed'
                })
        except Exception as api_err:
            logger.warning(f"Groq proofread failed, using fallback: {api_err}")
            return jsonify({
                'original': text,
                'corrected': None,
                'message': 'AI Proofreading is currently unavailable. No corrections made.'
            })

    except Exception as e:
        logger.error(f"Proofread error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
@require_auth
def generate_news():
    data = request.json or {}
    topic = data.get('topic', '')
    if not topic:
        return jsonify({'error': 'No topic provided'}), 400
    
    try:
        if not GROQ_ENABLED:
            return jsonify({'error': 'AI is disabled on the server.'}), 503

        prompt = f"""
You are the NewsGuard AI, an expert, objective journalist and editor.
Write a comprehensive, factual, and well-structured news article about the following topic: "{topic}".
Ensure the tone is professional, neutral, and engaging.

Return JSON only with these fields:
- headline: A catchy, factual headline.
- content: The full article content formatted in valid HTML (use <h2>, <p>, <strong>, etc. as appropriate).

IMPORTANT: Never refer to yourself as Gemini. Do not include any markdown formatting outside the JSON object.
"""
        try:
            raw_text = run_ai_chat(prompt, 0.7)
            if not raw_text:
                 return jsonify({'error': 'No content generated by AI'}), 500
                 
            parsed = json.loads(raw_text)
            return jsonify({
                'headline': parsed.get('headline'),
                'content': parsed.get('content')
            })
        except Exception as api_err:
            logger.warning(f"Groq generate failed, using fallback: {api_err}")
            # Fallback logic for generation when Groq is unavailable
            fallback_headline = f"Report: {topic.title()}"
            fallback_content = f"<h2>{topic.title()}</h2><p>Our advanced AI generation service is currently undergoing maintenance or unavailable. This is a temporary placeholder for the topic: <strong>{topic}</strong>.</p><p>Please use your journalistic expertise to draft the article manually using the editor.</p>"
            return jsonify({
                'headline': fallback_headline,
                'content': fallback_content
            })

    except Exception as e:
        logger.error(f"Generate error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/analytics', methods=['GET'])
@require_auth
def get_global_analytics():
    return jsonify({
        'system_health': 'optimal',
        'total_checks_24h': 1420,
        'ai_confidence_avg': 92.4,
        'flagged_content_rate': 0.12
    })

@app.route('/forecast', methods=['POST'])
@require_auth
def forecast():
    data = request.json
    total = data.get('total', 0)
    fake = data.get('fake', 0)
    verified = data.get('verified', 0)
    unsure = data.get('unsure', 0)
    
    # Fallback math logic
    ratio = fake / total if total > 0 else 0
    fallback_risk = 'Critical' if ratio > 0.4 else 'Moderate' if ratio > 0.2 else 'Low'
    fallback_trend = 'Ascending' if ratio > 0.3 else 'Plateau'
    
    if not GROQ_ENABLED:
        return jsonify({'risk': fallback_risk, 'trend': fallback_trend, 'source': 'math'})

    try:
        prompt = f"""
        You are a neural forecasting unit for a news verification platform.
        Analyze the current system stats:
        Total Articles Scanned: {total}
        Fake Articles Detected: {fake}
        Verified Articles: {verified}
        Unsure Articles: {unsure}

        Based on the frequency of misinformation versus verified facts, determine:
        1. risk: The current threat level of misinformation spread. Must be exactly one of: "Low", "Moderate", "Critical".
        2. trend: The current direction of the threat. Must be exactly one of: "Plateau", "Ascending", "Descending".

        Return ONLY JSON with the fields:
        - risk
        - trend
        """
        
        raw_text = run_ai_chat(prompt, 0.1)
        if raw_text:
            parsed = json.loads(raw_text)
            return jsonify({
                'risk': parsed.get('risk', fallback_risk),
                'trend': parsed.get('trend', fallback_trend),
                'source': 'groq_llama'
            })
    except Exception as e:
        logger.error(f"Groq forecast failed, using fallback: {e}")
        
    return jsonify({'risk': fallback_risk, 'trend': fallback_trend, 'source': 'math (fallback)'})

# --- Admin Maintenance Endpoints ---

@app.route('/admin/scrape-social', methods=['POST'])
@require_auth
def run_scrape_social():
    try:
        # Run the fetch_social_trends.py script
        result = subprocess.run(['python', 'fetch_social_trends.py'], capture_output=True, text=True)
        return jsonify({
            'status': 'success' if result.returncode == 0 else 'error',
            'output': result.stdout,
            'error': result.stderr
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/sync', methods=['POST'])
@require_auth
def run_sync():
    try:
        # Run the sync_to_appwrite.py script
        result = subprocess.run(['python', 'sync_to_appwrite.py'], capture_output=True, text=True)
        return jsonify({
            'status': 'success' if result.returncode == 0 else 'error',
            'output': result.stdout,
            'error': result.stderr
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/scrape', methods=['POST'])
@require_auth
def run_scrape():
    try:
        # Run the fetch_african_facts.py script
        result = subprocess.run(['python', 'fetch_african_facts.py'], capture_output=True, text=True)
        return jsonify({
            'status': 'success' if result.returncode == 0 else 'error',
            'output': result.stdout,
            'error': result.stderr
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/clean', methods=['POST'])
@require_auth
def run_clean():
    try:
        result = subprocess.run(['python', 'clean_data.py'], capture_output=True, text=True)
        return jsonify({
            'status': 'success' if result.returncode == 0 else 'error',
            'output': result.stdout,
            'error': result.stderr
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/train', methods=['POST'])
@require_auth
def run_train():
    try:
        # We start it in the background as it might take time
        # For simplicity, we'll use a basic train script here or trigger train_model.py
        # If the user wants afriberta, they should use train_afriberta.py but it needs GPU
        script = 'train_model.py'
        subprocess.Popen(['python', script])
        return jsonify({'status': 'started', 'message': f'Training process started with {script}'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/clean-data', methods=['POST'])
@require_auth
def clean_data():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        file_content = file.read()
        output, stats = clean_news_data(file_content, file.filename)
        
        if output is None:
            return jsonify({"error": stats}), 400

        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name=f"cleaned_{file.filename.split('.')[0]}.csv"
        ), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
