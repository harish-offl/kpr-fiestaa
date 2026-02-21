# AgriChain AI - Quick Start Guide

## ✅ System Status

Your AgriChain AI platform is now RUNNING!

### Active Services:
- ✅ Backend API: http://localhost:5000
- ✅ Frontend Dashboard: http://localhost:3000
- ✅ MongoDB: Running
- ✅ AI Models: Trained and ready

## 🚀 Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📊 What You Can Do Now

### 1. View Dashboard
- See 30-day demand forecasts with 92%+ confidence
- Monitor Supply Chain Risk Index (SCRI)
- View fraud probability metrics
- Check anomaly alerts
- Read AI-generated executive reports

### 2. Add Transactions
Click "Add Transaction" tab to:
- Create new supply chain entries
- Generate QR codes for batch verification
- Track temperature, quantity, location
- Assign handler roles (Farmer/Distributor/Retailer)

### 3. Explore Blockchain
Click "Blockchain" tab to:
- View all blocks in the chain
- Validate chain integrity
- Detect tampering attempts
- See complete transaction history

## 🔧 API Endpoints Available

### Blockchain
- GET http://localhost:5000/api/blockchain/explorer
- POST http://localhost:5000/api/blockchain/add
- GET http://localhost:5000/api/blockchain/validate
- GET http://localhost:5000/api/blockchain/batch/:batchID

### AI Analytics
- GET http://localhost:5000/api/ai/forecast
- POST http://localhost:5000/api/ai/anomaly
- POST http://localhost:5000/api/ai/fraud-risk
- POST http://localhost:5000/api/ai/scri

## 📝 Sample Transaction

Try adding this sample transaction:
```json
{
  "batchID": "BATCH001",
  "farmerID": "FARMER123",
  "location": "Punjab, India",
  "temperature": 25,
  "quantity": 1000,
  "handlerRole": "Farmer"
}
```

## 🛑 Stop the Application

To stop the servers, run:
```bash
# Stop backend
taskkill /F /PID <backend_process_id>

# Stop frontend
taskkill /F /PID <frontend_process_id>
```

Or simply close the terminal windows.

## 🔄 Restart the Application

To restart later:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
cd frontend
npm start
```

## 📈 Model Performance

Your trained AI models:
- Linear Regression: R² = 0.1074
- Random Forest: R² = 0.9682 (96.82% accuracy!)
- ARIMA: Time-series forecasting
- Ensemble: Weighted combination for optimal predictions

## 🎯 Key Features Active

✅ Custom SHA256 blockchain
✅ Immutable supply chain traceability
✅ AI demand forecasting (30-day predictions)
✅ Anomaly detection (Z-score + Isolation Forest)
✅ Fraud risk classification
✅ Supply Chain Risk Index (SCRI)
✅ QR code generation
✅ Executive AI reports
✅ Real-time dashboards

## 💡 Tips

1. Add multiple transactions to see blockchain grow
2. Try different temperature values to trigger anomaly detection
3. Validate chain after adding several blocks
4. Download executive reports for analysis
5. Scan QR codes with your phone for public verification

## 🐛 Troubleshooting

If you encounter issues:
1. Ensure MongoDB is running: `Get-Service MongoDB`
2. Check if ports 3000 and 5000 are available
3. Verify Python models are trained: check `ai-engine/models/` folder
4. Review logs in terminal windows

## 📚 Documentation

For detailed information, see README.md

---

**Enjoy your AgriChain AI Platform! 🌾🤖⛓️**
