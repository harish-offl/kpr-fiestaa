import pickle
import numpy as np
import json
import sys

def load_models():
    lr = pickle.load(open('ai-engine/models/linear_regression.pkl', 'rb'))
    rf = pickle.load(open('ai-engine/models/random_forest.pkl', 'rb'))
    arima = pickle.load(open('ai-engine/models/arima_model.pkl', 'rb'))
    metrics = json.load(open('ai-engine/models/metrics.json', 'r'))
    return lr, rf, arima, metrics

def forecast_demand(days=30):
    lr, rf, arima, metrics = load_models()
    
    # Generate future features
    future_days = np.arange(365, 365 + days)
    X_future = np.column_stack([
        future_days % 365,
        (future_days % 365) // 30 + 1,
        future_days % 7
    ])
    
    # Predictions
    lr_pred = lr.predict(X_future)
    rf_pred = rf.predict(X_future)
    arima_pred = arima.forecast(steps=days)
    
    # Ensemble
    ensemble = 0.4 * lr_pred + 0.3 * rf_pred + 0.3 * arima_pred
    
    # Calculate confidence
    data_quality = 0.92
    avg_accuracy = (metrics['linear_regression']['accuracy'] + 
                   metrics['random_forest']['accuracy'] + 
                   metrics['arima']['accuracy']) / 3
    confidence = (avg_accuracy / 100) * data_quality * 100
    
    # Growth calculation
    current_avg = np.mean(ensemble[:7])
    future_avg = np.mean(ensemble[-7:])
    growth = ((future_avg - current_avg) / current_avg) * 100
    
    return {
        'forecast': ensemble.tolist(),
        'growth_percentage': float(growth),
        'confidence': float(confidence),
        'metrics': metrics
    }

def detect_anomaly(temperature, quantity, delay):
    # Z-score calculation
    temp_mean, temp_std = 25, 5
    z_score = abs((temperature - temp_mean) / temp_std)
    
    anomaly_detected = z_score > 2
    anomaly_prob = min(z_score / 3 * 100, 100)
    
    explanation = ""
    if anomaly_detected:
        deviation = ((temperature - temp_mean) / temp_mean) * 100
        explanation = f"Temperature exceeded acceptable threshold by {abs(deviation):.1f}% during transport phase, increasing spoilage risk probability."
    
    return {
        'anomaly_detected': bool(anomaly_detected),
        'probability': float(anomaly_prob),
        'z_score': float(z_score),
        'explanation': explanation
    }

def calculate_fraud_risk(anomaly_score, delay_factor, trust_score):
    fraud_risk = 0.5 * anomaly_score + 0.3 * delay_factor + 0.2 * (100 - trust_score)
    
    if fraud_risk < 30:
        category = 'Low'
        action = 'Continue monitoring standard protocols'
    elif fraud_risk < 60:
        category = 'Medium'
        action = 'Increase inspection frequency and verify documentation'
    else:
        category = 'High'
        action = 'Immediate investigation required - halt shipment pending review'
    
    return {
        'fraud_probability': float(fraud_risk),
        'risk_category': category,
        'action_recommendation': action
    }

def calculate_scri(fraud_risk, delay_score, temp_anomaly, demand_volatility):
    scri = 0.4 * fraud_risk + 0.3 * delay_score + 0.2 * temp_anomaly + 0.1 * demand_volatility
    return float(scri)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        action = sys.argv[1]
        if action == 'forecast':
            result = forecast_demand()
            print(json.dumps(result))
        elif action == 'anomaly':
            temp = float(sys.argv[2])
            qty = float(sys.argv[3])
            delay = float(sys.argv[4])
            result = detect_anomaly(temp, qty, delay)
            print(json.dumps(result))
