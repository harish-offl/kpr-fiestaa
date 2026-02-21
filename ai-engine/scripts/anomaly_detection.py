"""
Anomaly Detection using Isolation Forest
Detects unusual patterns in supply chain data
"""

import sys
import json
import pandas as pd
import joblib
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# Paths
MODEL_PATH = 'ai-engine/models/anomaly_model.pkl'
SCALER_PATH = 'ai-engine/models/anomaly_scaler.pkl'
DATA_PATH = 'ai-engine/data/sample_data.csv'

def train_anomaly_model():
    """Train Isolation Forest model for anomaly detection"""
    print("Training Anomaly Detection Model...")
    
    # Load data
    df = pd.read_csv(DATA_PATH)
    
    # Select numerical features
    features = ['demand', 'quantity', 'delay_days', 'temperature', 'stock_level']
    X = df[features].fillna(0)
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train Isolation Forest
    model = IsolationForest(
        contamination=0.05,
        random_state=42,
        n_estimators=100
    )
    model.fit(X_scaled)
    
    # Save model and scaler
    os.makedirs('ai-engine/models', exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    print("✓ Anomaly Detection Model trained and saved")
    return model, scaler

def load_model():
    """Load trained model or train new one"""
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        return model, scaler
    else:
        return train_anomaly_model()

def detect_anomaly(input_dict):
    """
    Detect if input data is anomalous
    
    Args:
        input_dict: Dictionary with keys: demand, quantity, delay_days, temperature, stock_level
    
    Returns:
        Dictionary with anomaly status and score
    """
    try:
        # Load model
        model, scaler = load_model()
        
        # Prepare input
        features = ['demand', 'quantity', 'delay_days', 'temperature', 'stock_level']
        input_data = [[
            input_dict.get('demand', 0),
            input_dict.get('quantity', 0),
            input_dict.get('delay_days', 0),
            input_dict.get('temperature', 0),
            input_dict.get('stock_level', 0)
        ]]
        
        # Scale input
        input_scaled = scaler.transform(input_data)
        
        # Predict
        prediction = model.predict(input_scaled)[0]  # -1 for anomaly, 1 for normal
        score = model.score_samples(input_scaled)[0]  # Anomaly score (lower = more anomalous)
        
        # Convert to readable format
        is_anomaly = prediction == -1
        
        return {
            "anomaly": bool(is_anomaly),
            "score": float(score),
            "severity": "HIGH" if score < -0.5 else "MEDIUM" if score < -0.2 else "LOW"
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "anomaly": False,
            "score": 0
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # CLI mode - receive JSON input
        try:
            input_json = sys.argv[1]
            input_data = json.loads(input_json)
            result = detect_anomaly(input_data)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        # Training mode
        train_anomaly_model()
        
        # Test with sample data
        test_data = {
            "demand": 500,
            "quantity": 1000,
            "delay_days": 2,
            "temperature": 25,
            "stock_level": 800
        }
        result = detect_anomaly(test_data)
        print("\nTest Result:")
        print(json.dumps(result, indent=2))
