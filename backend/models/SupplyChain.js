const mongoose = require('mongoose');

const supplyChainSchema = new mongoose.Schema({
  batchID: { type: String, required: true, unique: true },
  farmerID: { type: String, required: true },
  location: String,
  temperature: Number,
  quantity: Number,
  handlerRole: String,
  timestamp: { type: Date, default: Date.now },
  anomalyScore: { type: Number, default: 0 },
  fraudRisk: { type: Number, default: 0 },
  trustScore: { type: Number, default: 100 }
});

const demandDataSchema = new mongoose.Schema({
  date: Date,
  product: String,
  quantity: Number,
  price: Number
});

const SupplyChain = mongoose.model('SupplyChain', supplyChainSchema);
const DemandData = mongoose.model('DemandData', demandDataSchema);

module.exports = { SupplyChain, DemandData };
