"""
Risk Forecasting using Logistic Regression
Predicts supply chain risk levels
"""

import sys
import json
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# Paths
MODEL_PATH = 'ai-engine/models/risk_model.pkl'
SCALER_PATH = 'ai-engine/models/risk_scaler.pkl'
DATA_PATH = 'ai-engine/data/sample_data.csv'

def create_risk_labels(df):
    """Create risk labels based on business logic"""
    # Risk factors: high delay, extreme temperature, low stock
    risk_score = (
        (df['delay_days'] > 3).astype(int) * 0.4 +
        ((df['temperature'] < 15) | (df['temperature'] > 30)).astype(int) * 0.3 +
        (df['stock_level'] < df['demand'] * 0.5).astype(int) * 0.3
    )
    
    # 0 = low risk, 1 = high risk
    return (risk_score > 0.5).astype(int)

def train_risk_model():
    """Train Logistic Regression model for risk prediction"""
    print("Training Risk Forecasting Model...")
    
    # Load data
    df = pd.read_csv(DATA_PATH)
    
    # Create risk labels
    df['risk_label'] = create_risk_labels(df)
    
    # Select features
    features = ['demand', 'delay_days', 'temperature', 'stock_level']
    X = df[features].fillna(0)
    y = df['risk_label']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Logistic Regression
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X_train_scaled, y_train)
    
    # Calculate accuracy
    accuracy = model.score(X_test_scaled, y_test)
    print(f"Model Accuracy: {accuracy:.2%}")
    
    # Get feature importance (coefficients)
    feature_importance = dict(zip(features, abs(model.coef_[0])))
    sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    
    print("\nFeature Importance:")
    for feat, importance in sorted_features:
        print(f"  {feat}: {importance:.4f}")
    
    # Save model and scaler
    os.makedirs('ai-engine/models', exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(dict(sorted_features), 'ai-engine/models/risk_feature_importance.pkl')
    
    print("\n✓ Risk Forecasting Model trained and saved")
    return model, scaler

def load_model():
    """Load trained model or train new one"""
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        return model, scaler
    else:
        return train_risk_model()

def predict_risk(data_dict):
    """
    Predict risk level for given data
    
    Args:
        data_dict: Dictionary with keys: demand, delay_days, temperature, stock_level
    
    Returns:
        Dictionary with risk probability and level
    """
    try:
        # Load model
        model, scaler = load_model()
        
        # Load feature importance
        if os.path.exists('ai-engine/models/risk_feature_importance.pkl'):
            feature_importance = joblib.load('ai-engine/models/risk_feature_importance.pkl')
            top_factors = list(feature_importance.keys())[:3]
        else:
            top_factors = ['delay_days', 'temperature', 'demand']
        
        # Prepare input
        features = ['demand', 'delay_days', 'temperature', 'stock_level']
        input_data = [[
            data_dict.get('demand', 0),
            data_dict.get('delay_days', 0),
            data_dict.get('temperature', 0),
            data_dict.get('stock_level', 0)
        ]]
        
        # Scale input
        input_scaled = scaler.transform(input_data)
        
        # Predict probability
        risk_probability = model.predict_proba(input_scaled)[0][1]  # Probability of high risk
        
        # Determine risk level
        if risk_probability < 0.4:
            risk_level = "LOW"
        elif risk_probability < 0.7:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"
        
        return {
            "risk_probability": float(risk_probability),
            "risk_level": risk_level,
            "top_factors": top_factors,
            "confidence": float(max(risk_probability, 1 - risk_probability))
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "risk_probability": 0.5,
            "risk_level": "UNKNOWN"
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # CLI mode - receive JSON input
        try:
            input_json = sys.argv[1]
            input_data = json.loads(input_json)
            result = predict_risk(input_data)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        # Training mode
        train_risk_model()
        
        # Test with sample data
        test_data = {
            "demand": 500,
            "delay_days": 5,
            "temperature": 35,
            "stock_level": 200
        }
        result = predict_risk(test_data)
        print("\nTest Result:")
        print(json.dumps(result, indent=2))
