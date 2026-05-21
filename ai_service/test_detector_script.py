import sys
import json
from app import app

client = app.test_client()

def test_text(text):
    print(f"\n--- Testing: {text} ---")
    response = client.post('/detect', json={'text': text})
    if response.status_code == 200:
        data = response.get_json()
        print(f"Result: {data.get('result')}")
        print(f"Score: {data.get('score')}")
        print(f"Explanation: {data.get('analysis', {}).get('explanation')}")
    else:
        print(f"Error: {response.status_code}")
        print(response.get_data(as_text=True))

if __name__ == '__main__':
    test_text("Breaking news: Aliens land on earth and offer free pizza")
    test_text("Official report confirms economy is growing steadily")
