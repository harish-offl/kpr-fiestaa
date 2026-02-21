# 📦 Sample Data Guide

## Overview
Your AgriChain platform has multiple types of sample data for different purposes.

---

## 1️⃣ Blockchain Sample Data (Supply Chain Transactions)

### Location:
- **Script:** `add-comprehensive-data.ps1`
- **Status:** ✅ Currently Loaded

### What's Included:
- **8 Batches** of agricultural products
- **27 Transactions** across the supply chain
- **Multiple locations:** Punjab, Delhi, Mumbai, Gujarat, Maharashtra, Bangalore, Hyderabad, Chennai, Kolkata

### Batch Details:

| Batch ID | Product | Steps | Journey |
|----------|---------|-------|---------|
| BATCH-2024-RICE-001 | Premium Basmati Rice | 4 | Punjab → Delhi → Mumbai → Bangalore |
| BATCH-2024-WHEAT-002 | Organic Wheat | 3 | Gujarat → Maharashtra → Hyderabad |
| BATCH-2024-CORN-003 | Sweet Corn | 4 | Punjab → Delhi → Hyderabad → Chennai |
| BATCH-2024-VEG-004 | Fresh Vegetables | 2 | Gujarat → Mumbai |
| BATCH-2024-RICE-005 | Rice (Temp Violation) | 3 | Maharashtra → Mumbai → Bangalore |
| BATCH-2024-WHEAT-006 | Premium Wheat | 3 | Delhi → Hyderabad → Kolkata |
| BATCH-2024-CORN-007 | Express Corn | 2 | Punjab → Delhi |
| BATCH-2024-VEG-008 | Premium Vegetables | 3 | Bangalore → Chennai → Hyderabad |

### How to Load:
```powershell
.\add-comprehensive-data.ps1
```

### How to View:
- **Frontend:** http://localhost:3000 → Traceability section
- **API:** http://localhost:5000/api/blockchain/explorer

---

## 2️⃣ AI Training Data (CSV)

### Location:
- **File:** `ai-engine/data/sample_data.csv`
- **Status:** ✅ Available

### Data Structure:
```csv
date,product,quantity,price,demand,delay_days,temperature,stock_level
2023-01-01,Rice,1000,50,950,0,22,1200
2023-01-02,Rice,1020,51,980,1,23,1180
...
```

### Contains:
- **60 rows** of historical supply chain data
- **8 columns:**
  - `date`: Transaction date
  - `product`: Product type (Rice, Wheat, Corn)
  - `quantity`: Quantity in kg
  - `price`: Price per unit
  - `demand`: Demand forecast
  - `delay_days`: Delivery delays
  - `temperature`: Storage temperature (°C)
  - `stock_level`: Current stock level

### Used For:
- Training Anomaly Detection model (Isolation Forest)
- Training Risk Forecasting model (Logistic Regression)
- Demand forecasting models

### How to View:
```powershell
Get-Content ai-engine/data/sample_data.csv | Select-Object -First 10
```

---

## 3️⃣ Trained AI Models

### Location:
- **Directory:** `ai-engine/models/`
- **Status:** ✅ All Trained

### Available Models:

#### Anomaly Detection:
- `anomaly_model.pkl` - Isolation Forest model
- `anomaly_scaler.pkl` - Feature scaler for anomaly detection

#### Risk Forecasting:
- `risk_model.pkl` - Logistic Regression model
- `risk_scaler.pkl` - Feature scaler for risk prediction
- `risk_feature_importance.pkl` - Feature importance weights

#### Demand Forecasting:
- `linear_regression.pkl` - Linear Regression model
- `random_forest.pkl` - Random Forest model
- `arima_model.pkl` - ARIMA time series model
- `metrics.json` - Model performance metrics

#### Fraud Detection:
- `fraud_classifier.pkl` - Fraud detection model
- `isolation_forest.pkl` - Anomaly-based fraud detection

### How to Retrain:
```powershell
# Retrain Anomaly Detection
python ai-engine/scripts/anomaly_detection.py

# Retrain Risk Forecasting
python ai-engine/scripts/risk_forecasting.py

# Retrain Demand Forecasting
python ai-engine/scripts/train_models.py
```

---

## 4️⃣ Test Data for API Endpoints

### Anomaly Detection Test:
```powershell
$body = @{
    demand = 500
    quantity = 1000
    delay_days = 2
    temperature = 25
    stock_level = 800
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/ai/anomaly-check' `
    -Method Post -Body $body -ContentType 'application/json'
```

### Risk Forecasting Test:
```powershell
$body = @{
    demand = 500
    delay_days = 5
    temperature = 35
    stock_level = 200
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/ai/risk-forecast' `
    -Method Post -Body $body -ContentType 'application/json'
```

### AI Report Generation Test:
```powershell
$body = @{
    demand = 500
    quantity = 1000
    delay_days = 2
    temperature = 25
    stock_level = 800
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/ai/generate-report' `
    -Method Post -Body $body -ContentType 'application/json'
```

### Complaint Creation Test:
```powershell
$body = @{
    user_id = 'USER-001'
    batch_id = 'BATCH-2024-RICE-001'
    issue_description = 'Temperature violation detected'
    priority = 'HIGH'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/complaints' `
    -Method Post -Body $body -ContentType 'application/json'
```

---

## 5️⃣ Quick Access Commands

### View Blockchain Data:
```powershell
# Get all blocks
Invoke-RestMethod -Uri 'http://localhost:5000/api/blockchain/explorer'

# Get specific batch
Invoke-RestMethod -Uri 'http://localhost:5000/api/blockchain/batch/BATCH-2024-RICE-001'

# Validate blockchain
Invoke-RestMethod -Uri 'http://localhost:5000/api/blockchain/validate'
```

### View Complaints:
```powershell
# Get all complaints
Invoke-RestMethod -Uri 'http://localhost:5000/api/complaints'

# Get complaint statistics
Invoke-RestMethod -Uri 'http://localhost:5000/api/complaints/stats/summary'
```

### View Operations Data:
```powershell
# Get KPIs
Invoke-RestMethod -Uri 'http://localhost:5000/api/operations/kpis'

# Get alerts
Invoke-RestMethod -Uri 'http://localhost:5000/api/operations/alerts'
```

---

## 6️⃣ Data Characteristics

### Temperature Ranges:
- **Normal:** 15°C - 30°C
- **Violation:** < 15°C or > 30°C
- **Critical:** < 10°C or > 35°C

### Risk Levels:
- **LOW:** Risk probability < 0.4
- **MEDIUM:** Risk probability 0.4 - 0.7
- **HIGH:** Risk probability > 0.7

### Anomaly Severity:
- **LOW:** Score > -0.2
- **MEDIUM:** Score -0.5 to -0.2
- **HIGH:** Score < -0.5

---

## 7️⃣ Sample Data Summary

| Data Type | Location | Count | Status |
|-----------|----------|-------|--------|
| Blockchain Transactions | In-memory | 38 blocks | ✅ Loaded |
| AI Training Data | CSV file | 60 rows | ✅ Available |
| Trained Models | models/ | 11 files | ✅ Ready |
| Batches | Blockchain | 8 batches | ✅ Active |
| Complaints | MongoDB | Variable | ✅ Ready |

---

## 8️⃣ Reload Sample Data

If you need to reload the blockchain sample data:

```powershell
# Method 1: Run the PowerShell script
.\add-comprehensive-data.ps1

# Method 2: Restart the server (data will be lost, need to reload)
# Stop server: Ctrl+C
# Start server: npm run dev
# Then run: .\add-comprehensive-data.ps1
```

---

## 9️⃣ Access Points

### Frontend Dashboard:
- **URL:** http://localhost:3000
- **Sections:**
  - Dashboard - Overview & metrics
  - Operations - Real-time tracking
  - Compliance - Violations & alerts
  - Traceability - Blockchain explorer
  - AI Insights - Predictions & reports
  - Supply Chain Map - Visual tracking

### Backend API:
- **Base URL:** http://localhost:5000/api
- **Endpoints:**
  - `/blockchain/*` - Blockchain operations
  - `/ai/*` - AI predictions
  - `/operations/*` - Operations data
  - `/compliance/*` - Compliance monitoring
  - `/complaints/*` - Complaint management

---

## 🎯 Quick Start

1. **Ensure server is running:**
   ```powershell
   npm run dev
   ```

2. **Load sample data:**
   ```powershell
   .\add-comprehensive-data.ps1
   ```

3. **Access frontend:**
   - Open http://localhost:3000

4. **Test API endpoints:**
   - Use the PowerShell commands above

---

## 📊 Data Statistics

**Current Status:**
- ✅ 38 blockchain blocks
- ✅ 8 unique batches
- ✅ 27 supply chain transactions
- ✅ 60 AI training records
- ✅ 11 trained models
- ✅ 9 locations covered
- ✅ 3 product types (Rice, Wheat, Corn, Vegetables)

---

**Last Updated:** February 21, 2026
**Status:** ✅ All Sample Data Available
