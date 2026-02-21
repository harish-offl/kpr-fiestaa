const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const http = require('http');
const socketIo = require('socket.io');
const { Blockchain } = require('./blockchain/Blockchain');
const { SupplyChain } = require('./models/SupplyChain');
const aiRoutes = require('./routes/ai');
const operationsRoutes = require('./routes/operations');
const complianceRoutes = require('./routes/compliance');
const complaintsRoutes = require('./routes/complaints');
const operationsService = require('./services/OperationsService');
const complianceService = require('./services/ComplianceService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Blockchain
const agriChain = new Blockchain();

// Set blockchain instance for complaints
complaintsRoutes.setBlockchain(agriChain);

// AI Routes
app.use('/api/ai', aiRoutes);

// Operations Routes
app.use('/api/operations', operationsRoutes);

// Compliance Routes
app.use('/api/compliance', complianceRoutes);

// Complaints Routes
app.use('/api/complaints', complaintsRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available globally for emitting events
global.io = io;

// MongoDB Connection (Optional - will work without it)
mongoose.connect('mongodb://localhost:27017/agrichain', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB not available - running without database persistence:', err.message));

// Routes
app.post('/api/blockchain/add', async (req, res) => {
  try {
    const data = req.body;
    const block = agriChain.addBlock(data);
    
    // Emit real-time event for new block
    if (global.io) {
      global.io.emit('new_block', {
        block: block,
        timestamp: Date.now(),
        batchID: data.batchID
      });
    }
    
    // Save to MongoDB (if connected)
    try {
      const record = new SupplyChain(data);
      await record.save();
    } catch (dbError) {
      console.log('MongoDB save skipped:', dbError.message);
    }
    
    // Update operations service
    operationsService.addShipment(data);
    
    // Check for compliance violations
    const fraudRisk = data.fraudRisk || Math.random() * 100;
    const scri = data.scri || operationsService.kpis.currentSCRI;
    const anomalyScore = (data.temperature < 15 || data.temperature > 30) ? 80 : 20;
    
    // Emit anomaly detection event
    if (anomalyScore > 50 && global.io) {
      global.io.emit('anomaly_detected', {
        batchID: data.batchID,
        temperature: data.temperature,
        anomalyScore: anomalyScore,
        timestamp: Date.now()
      });
    }
    
    if (complianceService.shouldEscalate(fraudRisk, scri, anomalyScore)) {
      const incident = complianceService.generateIncidentReport({
        batchID: data.batchID,
        supplierID: data.supplierID,
        fraudRisk,
        scri,
        anomalyScore,
        temperature: data.temperature,
        location: data.location,
        handlerRole: data.handlerRole,
        timestamp: data.timestamp
      });
      
      // Store incident hash on blockchain
      agriChain.addBlock({
        type: 'COMPLIANCE_INCIDENT',
        incidentID: incident.incidentID,
        reportHash: incident.reportHash,
        severity: incident.severity,
        timestamp: incident.reportedAt
      });
    }
    
    res.json({ success: true, block });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/blockchain/validate', (req, res) => {
  const validation = agriChain.validateChain();
  res.json(validation);
});

app.get('/api/blockchain/tampering', (req, res) => {
  const result = agriChain.detectTampering();
  res.json(result);
});

app.get('/api/blockchain/explorer', (req, res) => {
  const blocks = agriChain.blockchainExplorer();
  res.json(blocks);
});

app.get('/api/blockchain/batch/:batchID', (req, res) => {
  const blocks = agriChain.getBlockByBatchID(req.params.batchID);
  res.json(blocks);
});

app.get('/api/qrcode/:batchID', async (req, res) => {
  try {
    const url = `http://localhost:3000/verify/${req.params.batchID}`;
    const qr = await QRCode.toDataURL(url);
    res.json({ qrCode: qr });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`AgriChain AI Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time updates`);
});
