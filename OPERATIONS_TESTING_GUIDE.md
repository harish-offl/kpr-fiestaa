# Operations Dashboard Testing Guide

## Quick Start Testing

### 1. Start the System
```bash
# Terminal 1 - Start MongoDB (if not running)
mongod

# Terminal 2 - Start Backend
cd backend
node server.js

# Terminal 3 - Start Frontend
cd frontend
npm start
```

### 2. Access the Dashboard
- Open browser: `http://localhost:3000`
- Click "📊 Operations Control" tab
- Dashboard should load with initial state

### 3. Add Test Transactions

#### Test Case 1: Normal Shipment (On-Time)
```json
{
  "batchID": "BATCH001",
  "location": "Punjab Farm",
  "handlerRole": "Farmer",
  "temperature": 22,
  "quantity": 1000,
  "crop": "Rice",
  "timestamp": "2024-01-15T10:00:00Z"
}
```
**Expected Results:**
- ✅ Appears in Active Shipment Tracking
- ✅ Progress bar at 33%
- ✅ Status: "On-Time" (green)
- ✅ Temperature: 22°C (green, within range)
- ✅ Inventory increases by 1000 kg
- ✅ KPI: Active Shipments +1

#### Test Case 2: Delayed Shipment (High Temperature)
```json
{
  "batchID": "BATCH002",
  "location": "Gujarat Farm",
  "handlerRole": "Distributor",
  "temperature": 38,
  "quantity": 500,
  "crop": "Rice",
  "timestamp": "2024-01-15T11:00:00Z"
}
```
**Expected Results:**
- ✅ Status: "Delayed" (red)
- ✅ Temperature: 38°C (red, anomaly)
- ✅ Appears in Delay Monitoring Panel
- ✅ Risk Level: "High"
- ✅ Alert generated: "Temperature Anomaly"
- ✅ Alert generated: "Delay Detected"
- ✅ Mitigation: "Immediate cold storage transfer required"
- ✅ Cold Chain Integrity: <80%
- ✅ On-Time Delivery % decreases

#### Test Case 3: Low Temperature Alert
```json
{
  "batchID": "BATCH003",
  "location": "Kashmir Farm",
  "handlerRole": "Farmer",
  "temperature": 8,
  "quantity": 750,
  "crop": "Rice",
  "timestamp": "2024-01-15T12:00:00Z"
}
```
**Expected Results:**
- ✅ Status: "Delayed" (red)
- ✅ Temperature: 8°C (red, below range)
- ✅ Temperature anomaly alert
- ✅ Mitigation: "Temperature too low. Adjust climate control"
- ✅ Cold Chain Integrity: Low score

#### Test Case 4: Low Stock Scenario
```json
{
  "batchID": "BATCH004",
  "location": "Warehouse A",
  "handlerRole": "Retailer",
  "temperature": 20,
  "quantity": 100,
  "crop": "Wheat",
  "timestamp": "2024-01-15T13:00:00Z"
}
```
**Expected Results:**
- ✅ New crop "Wheat" appears in inventory
- ✅ Total: 100 kg (below 500 kg threshold)
- ✅ Low Stock Alert generated
- ✅ Red indicator on inventory card
- ✅ Alert: "Wheat inventory below threshold"

#### Test Case 5: Multiple Shipments (Flow Visualization)
Add 3-5 shipments with different handler roles:
```json
// Farmer shipments
{"batchID": "BATCH005", "handlerRole": "Farmer", "temperature": 23, "quantity": 800}
{"batchID": "BATCH006", "handlerRole": "Farmer", "temperature": 21, "quantity": 900}

// Distributor shipments
{"batchID": "BATCH007", "handlerRole": "Distributor", "temperature": 24, "quantity": 600}
{"batchID": "BATCH008", "handlerRole": "Distributor", "temperature": 22, "quantity": 700}

// Retailer shipments
{"batchID": "BATCH009", "handlerRole": "Retailer", "temperature": 25, "quantity": 500}
```
**Expected Results:**
- ✅ Supply Flow Visualization updates
- ✅ Farmer → Distributor shows 2 shipments
- ✅ Distributor → Retailer shows 2 shipments
- ✅ Total Flow count increases
- ✅ Active Shipments count reflects all batches

## Verification Checklist

### KPI Cards
- [ ] Active Shipments Count updates correctly
- [ ] On-Time Delivery % calculates accurately
- [ ] Average Delay Duration shows in hours
- [ ] Current SCRI displays (default: 48)
- [ ] Demand Volatility updates with new shipments

### Active Shipment Tracking
- [ ] All shipments display with correct batch IDs
- [ ] Origin → Destination shows correctly
- [ ] Progress bars match handler role (Farmer: 33%, Distributor: 66%, Retailer: 100%)
- [ ] Delay status color-coded properly
- [ ] Temperature displays with correct color
- [ ] Quantity shows in kg
- [ ] ETA calculates correctly

### Live Inventory Status
- [ ] Total stock aggregates correctly
- [ ] Warehouse breakdown displays
- [ ] Stock level progress bar updates
- [ ] Low stock alert triggers at <500 kg
- [ ] Overstock alert triggers at >5000 kg
- [ ] Color coding: Red (low), Green (normal), Orange (overstock)

### Delay Monitoring Panel
- [ ] Only delayed shipments appear
- [ ] Delay duration calculated
- [ ] Risk level assigned (High/Medium)
- [ ] Mitigation suggestions display
- [ ] Count badge shows correct number

### Temperature Monitoring Stream
- [ ] Latest 10 readings display
- [ ] Temperature value prominent
- [ ] Acceptable range shown (15-30°C)
- [ ] Anomaly flag for out-of-range
- [ ] Cold Chain Integrity score calculates
- [ ] Progress bar color matches score
- [ ] Timestamp displays

### Supply Flow Visualization
- [ ] Three nodes display (Farmer, Distributor, Retailer)
- [ ] Arrows connect nodes
- [ ] Shipment counts show on connections
- [ ] Risk color coding on nodes
- [ ] Total flow metric calculates
- [ ] Low risk nodes count
- [ ] Risk nodes count

### Live Alerts Panel
- [ ] Alerts appear immediately
- [ ] Severity color coding (Info/Warning/Danger)
- [ ] Alert type displays
- [ ] Message shows details
- [ ] Timestamp accurate
- [ ] Count badge updates
- [ ] Scrollable list

### Real-Time Updates
- [ ] Dashboard refreshes every 5 seconds
- [ ] "Live" indicator pulses
- [ ] Last update timestamp changes
- [ ] No manual reload needed
- [ ] Data consistency maintained

## Performance Testing

### Load Test
1. Add 20+ transactions rapidly
2. Verify dashboard remains responsive
3. Check all components update
4. Confirm no memory leaks
5. Monitor network requests

### Stress Test
1. Add 50+ transactions
2. Check scroll performance
3. Verify data limits (20 temp readings, 50 alerts)
4. Confirm old data cleanup
5. Test browser performance

## API Testing

### Test Endpoints Directly
```bash
# Get complete dashboard data
curl http://localhost:5000/api/operations/dashboard

# Get active shipments
curl http://localhost:5000/api/operations/shipments

# Get inventory
curl http://localhost:5000/api/operations/inventory

# Get delays
curl http://localhost:5000/api/operations/delays

# Get temperature stream
curl http://localhost:5000/api/operations/temperature

# Get alerts
curl http://localhost:5000/api/operations/alerts

# Get KPIs
curl http://localhost:5000/api/operations/kpis

# Update SCRI
curl -X POST http://localhost:5000/api/operations/scri \
  -H "Content-Type: application/json" \
  -d '{"scri": 75}'
```

## Common Issues & Solutions

### Issue: Dashboard shows "No operations data available"
**Solution:** Add at least one transaction via blockchain

### Issue: Data not updating
**Solution:** Check browser console, verify backend is running, check network tab

### Issue: Alerts not appearing
**Solution:** Verify temperature is out of range (15-30°C) or stock is below/above thresholds

### Issue: Progress bars not showing
**Solution:** Ensure handlerRole is one of: Farmer, Distributor, Retailer

### Issue: Inventory not updating
**Solution:** Check that quantity field is included in transaction

## Success Criteria

✅ All 7 feature sections display correctly
✅ Real-time updates work without manual refresh
✅ Alerts generate for anomalies
✅ KPIs calculate accurately
✅ Visual indicators color-coded properly
✅ No console errors
✅ Responsive to new transactions
✅ Performance remains smooth with multiple shipments

## Next Steps After Testing

1. Document any bugs found
2. Test edge cases (negative values, missing fields)
3. Verify mobile responsiveness
4. Test with different browsers
5. Load test with production-like data volumes
6. Security testing for API endpoints
7. Integration testing with AI engine
8. End-to-end workflow testing
