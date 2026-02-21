# AgriChain AI – Blockchain-Based Autonomous Supply Chain Intelligence Platform

Complete full-stack application with blockchain traceability, AI demand forecasting, anomaly detection, fraud risk analysis, real-time operations monitoring, and executive reporting.

## Features

✓ Custom SHA256 blockchain implementation
✓ Ensemble AI demand forecasting (Linear Regression + Random Forest + ARIMA)
✓ Anomaly detection (Z-score + Isolation Forest)
✓ Fraud risk classification
✓ Supply Chain Risk Index (SCRI)
✓ Real-Time Operations Dashboard with live monitoring
✓ Active shipment tracking with progress visualization
✓ Live inventory management with alerts
✓ Temperature monitoring and cold-chain integrity
✓ Delay detection with mitigation suggestions
✓ Supply flow visualization
✓ AI-generated executive reports
✓ QR code batch verification
✓ Real-time dashboard with Chart.js
✓ 100% local - NO API keys required

## Tech Stack

- Frontend: React.js + Tailwind CSS + Chart.js
- Backend: Node.js + Express
- AI Engine: Python + scikit-learn + statsmodels
- Database: MongoDB (local)
- Blockchain: Custom SHA256 implementation

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB (local instance)

### Installation

1. Install Python dependencies:
```bash
pip install -r ai-engine/requirements.txt
```

2. Train AI models:
```bash
npm run train
```

3. Install Node.js dependencies:
```bash
npm install
cd frontend && npm install
```

4. Start MongoDB:
```bash
mongod
```

5. Start backend server:
```bash
npm run server
```

6. Start frontend (in new terminal):
```bash
npm run client
```

7. Access application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Blockchain
- POST /api/blockchain/add - Add new block
- GET /api/blockchain/validate - Validate chain integrity
- GET /api/blockchain/explorer - View all blocks
- GET /api/blockchain/batch/:batchID - Get blocks by batch

### AI Analytics
- GET /api/ai/forecast - 30-day demand forecast
- POST /api/ai/anomaly - Detect anomalies
- POST /api/ai/fraud-risk - Calculate fraud probability
- POST /api/ai/scri - Calculate Supply Chain Risk Index
- POST /api/ai/generate-report - Generate executive report

### Operations Dashboard
- GET /api/operations/dashboard - Complete operational data
- GET /api/operations/shipments - Active shipments
- GET /api/operations/inventory - Inventory status
- GET /api/operations/delays - Delay information
- GET /api/operations/temperature - Temperature stream
- GET /api/operations/alerts - Live alerts
- GET /api/operations/kpis - Current KPIs
- POST /api/operations/scri - Update SCRI value

### QR Code
- GET /api/qrcode/:batchID - Generate verification QR code

## Project Structure

```
agrichain-ai/
├── backend/
│   ├── blockchain/
│   │   └── Blockchain.js          # Custom blockchain implementation
│   ├── models/
│   │   └── SupplyChain.js         # MongoDB schemas
│   ├── routes/
│   │   ├── ai.js                  # AI endpoints
│   │   └── operations.js          # Operations endpoints
│   ├── services/
│   │   └── OperationsService.js   # Real-time operations logic
│   └── server.js                  # Express server
├── ai-engine/
│   ├── models/                    # Trained ML models
│   ├── scripts/
│   │   ├── train_models.py        # Model training
│   │   └── predict.py             # Prediction engine
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx              # Main analytics dashboard
│   │   │   ├── OperationsDashboard.jsx    # Real-time operations control
│   │   │   ├── BlockchainExplorer.jsx
│   │   │   └── AddTransaction.jsx
│   │   └── App.jsx
│   └── public/
├── OPERATIONS_DASHBOARD.md        # Operations dashboard documentation
├── OPERATIONS_TESTING_GUIDE.md    # Testing guide
└── package.json
```

## Usage

1. Add supply chain transactions via "Add Transaction" tab
2. Monitor real-time operations in "Operations Control" tab
3. View blockchain integrity in "Blockchain" tab
4. Monitor AI analytics in "Dashboard" tab
5. Download executive reports
6. Scan QR codes for public verification

## Real-Time Operations Dashboard

The Operations Control Center provides:
- Active shipment tracking with progress bars
- Live inventory status with warehouse breakdown
- Delay monitoring with mitigation suggestions
- Temperature monitoring with cold-chain integrity scores
- Supply flow visualization (Farmer → Distributor → Retailer)
- Live alerts panel with severity-based notifications
- Operational KPIs (Active shipments, On-time delivery %, Avg delay, SCRI, Demand volatility)
- Auto-refresh every 5 seconds

See `OPERATIONS_DASHBOARD.md` for complete documentation.

## Model Performance

- Linear Regression: R² score displayed in dashboard
- Random Forest: R² score displayed in dashboard
- ARIMA: Time-series forecasting accuracy
- Ensemble: Weighted combination (40% LR + 30% RF + 30% ARIMA)

## Security Features

- Immutable blockchain with SHA256 hashing
- Chain validation and tampering detection
- Fraud risk scoring
- Anomaly detection across multiple dimensions
- Trust score system for suppliers
- Real-time temperature monitoring
- Cold-chain integrity verification

## License

MIT
