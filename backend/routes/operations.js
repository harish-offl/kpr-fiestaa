const express = require('express');
const router = express.Router();
const operationsService = require('../services/OperationsService');

// Get complete operational dashboard data
router.get('/dashboard', (req, res) => {
  try {
    const data = operationsService.getOperationalData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active shipments
router.get('/shipments', (req, res) => {
  try {
    res.json(operationsService.activeShipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory status
router.get('/inventory', (req, res) => {
  try {
    res.json(operationsService.inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get delays
router.get('/delays', (req, res) => {
  try {
    res.json(operationsService.delays);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get temperature stream
router.get('/temperature', (req, res) => {
  try {
    res.json(operationsService.temperatureStream.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alerts
router.get('/alerts', (req, res) => {
  try {
    res.json(operationsService.alerts.slice(0, 20));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get KPIs
router.get('/kpis', (req, res) => {
  try {
    res.json(operationsService.kpis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update SCRI
router.post('/scri', (req, res) => {
  try {
    const { scri } = req.body;
    operationsService.updateSCRI(scri);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
