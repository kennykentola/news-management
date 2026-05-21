---
title: NewsGuard AI
emoji: 📰
colorFrom: blue
colorTo: green
sdk: docker
app_file: app.py
pinned: false
---

# News Management System

A comprehensive news platform with AI-powered fake news detection.

## Quick Start

### Frontend (Client)
1. Navigate to `client/`
2. `npm install`
3. `npm run dev`

### AI Service
1. Navigate to `ai_service/`
2. `pip install -r requirements.txt` for the runtime API. This file is intentionally lean so deployment builds stay fast and reliable.
3. If you plan to retrain the model or run the training scripts, also install `pip install -r requirements-training.txt`.
4. `python app.py`

### Environment Files
1. Copy or edit `client/.env` for frontend settings.
2. Copy or edit `ai_service/.env` for backend and Gemini settings.
3. Add your own `APPWRITE_API_KEY` and `GEMINI_API_KEY` values before running the services.

## AI Model Maintenance

**Status:** The model is currently trained and working.

### How to Add More Data
1. Add your new rows to `ai_service/dataset.csv`.
2. You can use numeric (`0`/`1`) or text (`REAL`/`FAKE`) labels.
3. To process the data and update the model, run:

```bash
cd ai_service
python clean_data.py
python train.py
```

*   `clean_data.py`: Standardizes the CSV format, fixes labels, and removes bad characters.
*   `train.py`: Trains the Naive Bayes model and saves it as `model.pkl`.

### Dependency Split
- `ai_service/requirements.txt`: runtime dependencies for the Flask API and Docker/Hugging Face deployment.
- `ai_service/requirements-training.txt`: heavier ML packages needed only for training and experimentation.
