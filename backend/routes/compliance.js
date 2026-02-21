const express = require('express');
const router = express.Router();
const complianceService = require('../services/ComplianceService');
const PDFDocument = require('pdfkit');

// Generate incident report
router.post('/incident/create', (req, res) => {
  try {
    const incident = complianceService.generateIncidentReport(req.body);
    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all incidents
router.get('/incidents', (req, res) => {
  try {
    const { severity, status, requiresEscalation } = req.query;
    const filters = {};
    
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (requiresEscalation !== undefined) filters.requiresEscalation = requiresEscalation === 'true';

    const incidents = complianceService.getIncidents(filters);
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get incident by ID
router.get('/incident/:incidentID', (req, res) => {
  try {
    const incident = complianceService.getIncidentById(req.params.incidentID);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create escalation
router.post('/escalation/create', (req, res) => {
  try {
    const { incidentID, escalatedBy, notes } = req.body;
    const escalation = complianceService.createEscalation(incidentID, escalatedBy, notes);
    res.json({ success: true, escalation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get escalations
router.get('/escalations', (req, res) => {
  try {
    const { status } = req.query;
    const escalations = complianceService.getEscalations(status);
    res.json(escalations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit complaint
router.post('/complaint/submit', (req, res) => {
  try {
    const complaint = complianceService.submitComplaint(req.body);
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notify authorities
router.post('/notify-authority', (req, res) => {
  try {
    const { escalationID, authorityType } = req.body;
    const notification = complianceService.notifyAuthorities(escalationID, authorityType);
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check supplier lock status
router.get('/supplier/:supplierID/lock-status', (req, res) => {
  try {
    const isLocked = complianceService.isSupplierLocked(req.params.supplierID);
    res.json({ supplierID: req.params.supplierID, isLocked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlock supplier
router.post('/supplier/:supplierID/unlock', (req, res) => {
  try {
    const { reason } = req.body;
    complianceService.unlockSupplier(req.params.supplierID, reason);
    res.json({ success: true, message: 'Supplier unlocked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit log
router.get('/audit-log', (req, res) => {
  try {
    const { limit } = req.query;
    const auditLog = complianceService.getAuditLog(limit ? parseInt(limit) : 100);
    res.json(auditLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get compliance statistics
router.get('/stats', (req, res) => {
  try {
    const stats = complianceService.getComplianceStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve incident
router.post('/incident/:incidentID/resolve', (req, res) => {
  try {
    const { resolution, resolvedBy } = req.body;
    const incident = complianceService.resolveIncident(req.params.incidentID, resolution, resolvedBy);
    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate PDF report
router.get('/incident/:incidentID/pdf', (req, res) => {
  try {
    const reportData = complianceService.getReportData(req.params.incidentID);
    const { incident } = reportData;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=incident-${incident.incidentID}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('COMPLIANCE INCIDENT REPORT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Incident Details
    doc.fontSize(14).text('Incident Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Incident ID: ${incident.incidentID}`);
    doc.text(`Batch ID: ${incident.batchID}`);
    doc.text(`Supplier ID: ${incident.supplierID}`);
    doc.text(`Severity: ${incident.severity}`);
    doc.text(`Status: ${incident.status}`);
    doc.text(`Reported At: ${new Date(incident.reportedAt).toLocaleString()}`);
    doc.moveDown();

    // Risk Metrics
    doc.fontSize(14).text('Risk Metrics', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Fraud Risk: ${incident.fraudRisk.toFixed(1)}%`);
    doc.text(`SCRI: ${incident.scri.toFixed(1)}`);
    doc.text(`Anomaly Score: ${incident.anomalyScore.toFixed(1)}%`);
    doc.text(`Temperature: ${incident.temperature}°C`);
    doc.text(`Location: ${incident.location}`);
    doc.text(`Handler Role: ${incident.handlerRole}`);
    doc.moveDown();

    // Findings
    if (incident.findings && incident.findings.length > 0) {
      doc.fontSize(14).text('Findings', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      incident.findings.forEach((finding, index) => {
        doc.text(`${index + 1}. ${finding.type} (${finding.severity})`);
        doc.text(`   ${finding.description}`, { indent: 20 });
        doc.text(`   Evidence: ${finding.evidence}`, { indent: 20 });
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Recommendations
    if (incident.recommendations && incident.recommendations.length > 0) {
      doc.fontSize(14).text('Recommendations', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      incident.recommendations.forEach((rec, index) => {
        doc.text(`${index + 1}. ${rec}`);
      });
      doc.moveDown();
    }

    // Escalation Info
    if (incident.requiresEscalation) {
      doc.fontSize(14).text('Escalation Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Escalation Required: YES`);
      doc.text(`Escalated At: ${incident.escalatedAt ? new Date(incident.escalatedAt).toLocaleString() : 'N/A'}`);
      doc.text(`Supplier Status: LOCKED`);
      doc.moveDown();
    }

    // Blockchain Hash
    doc.fontSize(14).text('Blockchain Verification', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Report Hash: ${incident.reportHash}`);
    doc.text(`This report is cryptographically secured and immutably stored on the blockchain.`);
    doc.moveDown(2);

    // Footer
    doc.fontSize(8).text('AgriChain AI - Compliance & Escalation Engine', { align: 'center' });
    doc.text('This is an official compliance document', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
