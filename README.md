---
title: NewsGuard AI
emoji: 📰
colorFrom: blue
colorTo: green
sdk: docker
app_file: app.py
pinned: false
---

# News Management System (TONIA)

A comprehensive news platform with AI-powered fake news detection.

## Quick Start

### Frontend (Client)
1. Navigate to `client/`
2. `npm install`
3. `npm run dev`

### AI Service
1. Navigate to `ai_service/`
2. `pip install -r requirements.txt` (or install manually: `flask flask-cors scikit-learn pandas joblib`)
3. `python app.py`

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
