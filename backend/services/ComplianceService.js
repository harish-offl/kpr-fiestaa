const crypto = require('crypto');

class ComplianceService {
  constructor() {
    this.incidents = [];
    this.escalations = [];
    this.auditLog = [];
    this.lockedSuppliers = new Set();
    this.complianceReports = [];
  }

  // Check if incident requires escalation
  shouldEscalate(fraudRisk, scri, anomalyScore) {
    return fraudRisk > 60 || scri > 70 || anomalyScore > 75;
  }

  // Generate severity classification
  classifySeverity(fraudRisk, scri, anomalyScore) {
    const maxScore = Math.max(fraudRisk, scri, anomalyScore);
    
    if (maxScore >= 90) return 'Critical';
    if (maxScore >= 75) return 'High';
    if (maxScore >= 50) return 'Medium';
    return 'Low';
  }

  // Generate incident report
  generateIncidentReport(data) {
    const {
      batchID,
      supplierID,
      fraudRisk,
      scri,
      anomalyScore,
      temperature,
      location,
      handlerRole,
      timestamp
    } = data;

    const severity = this.classifySeverity(fraudRisk, scri, anomalyScore);
    const requiresEscalation = this.shouldEscalate(fraudRisk, scri, anomalyScore);

    const incident = {
      incidentID: `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      batchID,
      supplierID: supplierID || `SUP-${handlerRole}`,
      severity,
      fraudRisk,
      scri,
      anomalyScore,
      temperature,
      location,
      handlerRole,
      requiresEscalation,
      status: requiresEscalation ? 'Escalated' : 'Reported',
      reportedAt: timestamp || new Date().toISOString(),
      reportHash: null,
      escalatedAt: requiresEscalation ? new Date().toISOString() : null,
      resolvedAt: null,
      findings: this.generateFindings(fraudRisk, scri, anomalyScore, temperature),
      recommendations: this.generateRecommendations(severity, fraudRisk, scri)
    };

    // Generate report hash for blockchain
    incident.reportHash = this.generateReportHash(incident);

    // Lock supplier if escalation required
    if (requiresEscalation) {
      this.lockSupplier(incident.supplierID, incident.incidentID);
    }

    this.incidents.push(incident);
    this.logAuditEvent('INCIDENT_CREATED', incident);

    return incident;
  }

  // Generate findings based on metrics
  generateFindings(fraudRisk, scri, anomalyScore, temperature) {
    const findings = [];

    if (fraudRisk > 60) {
      findings.push({
        type: 'Fraud Risk',
        severity: fraudRisk > 80 ? 'Critical' : 'High',
        description: `Fraud probability detected at ${fraudRisk.toFixed(1)}%, exceeding acceptable threshold of 60%`,
        evidence: 'Pattern analysis indicates suspicious transaction behavior'
      });
    }

    if (scri > 70) {
      findings.push({
        type: 'Supply Chain Risk',
        severity: scri > 85 ? 'Critical' : 'High',
        description: `SCRI index at ${scri.toFixed(1)}, indicating elevated supply chain risk`,
        evidence: 'Multiple risk factors detected across supply chain operations'
      });
    }

    if (anomalyScore > 75) {
      findings.push({
        type: 'Anomaly Detection',
        severity: anomalyScore > 90 ? 'Critical' : 'High',
        description: `Anomaly score of ${anomalyScore.toFixed(1)}% detected`,
        evidence: 'Statistical deviation from normal operational parameters'
      });
    }

    if (temperature < 15 || temperature > 30) {
      findings.push({
        type: 'Temperature Violation',
        severity: Math.abs(temperature - 22.5) > 15 ? 'Critical' : 'Medium',
        description: `Temperature recorded at ${temperature}°C, outside acceptable range (15-30°C)`,
        evidence: 'Cold chain integrity compromised'
      });
    }

    return findings;
  }

  // Generate recommendations
  generateRecommendations(severity, fraudRisk, scri) {
    const recommendations = [];

    if (severity === 'Critical') {
      recommendations.push('IMMEDIATE ACTION REQUIRED: Halt all operations with this supplier');
      recommendations.push('Initiate comprehensive audit of all recent transactions');
      recommendations.push('Notify regulatory authorities within 24 hours');
      recommendations.push('Preserve all evidence for legal proceedings');
    } else if (severity === 'High') {
      recommendations.push('Suspend supplier pending investigation');
      recommendations.push('Conduct detailed review of transaction history');
      recommendations.push('Implement enhanced monitoring protocols');
      recommendations.push('Prepare incident report for management review');
    } else if (severity === 'Medium') {
      recommendations.push('Increase inspection frequency for this supplier');
      recommendations.push('Request additional documentation and verification');
      recommendations.push('Monitor closely for 30 days');
    } else {
      recommendations.push('Continue standard monitoring protocols');
      recommendations.push('Document incident for future reference');
    }

    if (fraudRisk > 70) {
      recommendations.push('Engage fraud investigation team');
      recommendations.push('Review supplier credentials and certifications');
    }

    if (scri > 75) {
      recommendations.push('Implement risk mitigation strategies');
      recommendations.push('Consider alternative suppliers for critical shipments');
    }

    return recommendations;
  }

  // Generate cryptographic hash of report
  generateReportHash(incident) {
    const reportData = JSON.stringify({
      incidentID: incident.incidentID,
      batchID: incident.batchID,
      supplierID: incident.supplierID,
      severity: incident.severity,
      fraudRisk: incident.fraudRisk,
      scri: incident.scri,
      reportedAt: incident.reportedAt
    });

    return crypto.createHash('sha256').update(reportData).digest('hex');
  }

  // Lock supplier
  lockSupplier(supplierID, incidentID) {
    this.lockedSuppliers.add(supplierID);
    this.logAuditEvent('SUPPLIER_LOCKED', {
      supplierID,
      incidentID,
      reason: 'Automatic lock due to escalation threshold breach',
      lockedAt: new Date().toISOString()
    });
  }

  // Unlock supplier
  unlockSupplier(supplierID, reason) {
    this.lockedSuppliers.delete(supplierID);
    this.logAuditEvent('SUPPLIER_UNLOCKED', {
      supplierID,
      reason,
      unlockedAt: new Date().toISOString()
    });
  }

  // Check if supplier is locked
  isSupplierLocked(supplierID) {
    return this.lockedSuppliers.has(supplierID);
  }

  // Create escalation
  createEscalation(incidentID, escalatedBy, notes) {
    const incident = this.incidents.find(i => i.incidentID === incidentID);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const escalation = {
      escalationID: `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      incidentID,
      escalatedBy,
      escalatedAt: new Date().toISOString(),
      severity: incident.severity,
      status: 'Pending',
      notes,
      authorityNotified: false,
      notificationSent: null,
      resolution: null,
      resolvedAt: null
    };

    this.escalations.push(escalation);
    incident.status = 'Escalated';
    
    this.logAuditEvent('ESCALATION_CREATED', escalation);

    return escalation;
  }

  // Submit complaint
  submitComplaint(data) {
    const {
      incidentID,
      complaintType,
      description,
      submittedBy,
      evidence,
      requestedAction
    } = data;

    const complaint = {
      complaintID: `CMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      incidentID,
      complaintType,
      description,
      submittedBy,
      evidence: evidence || [],
      requestedAction,
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      assignedTo: null,
      resolution: null,
      resolvedAt: null
    };

    this.complianceReports.push(complaint);
    this.logAuditEvent('COMPLAINT_SUBMITTED', complaint);

    return complaint;
  }

  // Notify authorities
  notifyAuthorities(escalationID, authorityType) {
    const escalation = this.escalations.find(e => e.escalationID === escalationID);
    if (!escalation) {
      throw new Error('Escalation not found');
    }

    const notification = {
      notificationID: `NOT-${Date.now()}`,
      escalationID,
      authorityType,
      notifiedAt: new Date().toISOString(),
      status: 'Sent',
      acknowledgment: null
    };

    escalation.authorityNotified = true;
    escalation.notificationSent = notification.notifiedAt;

    this.logAuditEvent('AUTHORITY_NOTIFIED', notification);

    return notification;
  }

  // Log audit event
  logAuditEvent(eventType, data) {
    const auditEntry = {
      auditID: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      timestamp: new Date().toISOString(),
      data,
      hash: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex'),
      previousHash: this.auditLog.length > 0 ? this.auditLog[this.auditLog.length - 1].hash : '0'
    };

    this.auditLog.push(auditEntry);
    return auditEntry;
  }

  // Get all incidents
  getIncidents(filters = {}) {
    let filtered = [...this.incidents];

    if (filters.severity) {
      filtered = filtered.filter(i => i.severity === filters.severity);
    }

    if (filters.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }

    if (filters.requiresEscalation !== undefined) {
      filtered = filtered.filter(i => i.requiresEscalation === filters.requiresEscalation);
    }

    return filtered.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
  }

  // Get escalations
  getEscalations(status = null) {
    if (status) {
      return this.escalations.filter(e => e.status === status);
    }
    return this.escalations.sort((a, b) => new Date(b.escalatedAt) - new Date(a.escalatedAt));
  }

  // Get audit log
  getAuditLog(limit = 100) {
    return this.auditLog.slice(-limit).reverse();
  }

  // Get compliance statistics
  getComplianceStats() {
    const totalIncidents = this.incidents.length;
    const criticalIncidents = this.incidents.filter(i => i.severity === 'Critical').length;
    const highIncidents = this.incidents.filter(i => i.severity === 'High').length;
    const escalatedIncidents = this.incidents.filter(i => i.requiresEscalation).length;
    const lockedSuppliers = this.lockedSuppliers.size;
    const pendingEscalations = this.escalations.filter(e => e.status === 'Pending').length;
    const totalComplaints = this.complianceReports.length;

    return {
      totalIncidents,
      criticalIncidents,
      highIncidents,
      escalatedIncidents,
      lockedSuppliers,
      pendingEscalations,
      totalComplaints,
      complianceRate: totalIncidents > 0 ? ((totalIncidents - escalatedIncidents) / totalIncidents * 100).toFixed(1) : 100,
      averageResolutionTime: this.calculateAverageResolutionTime()
    };
  }

  // Calculate average resolution time
  calculateAverageResolutionTime() {
    const resolved = this.incidents.filter(i => i.resolvedAt);
    if (resolved.length === 0) return 0;

    const totalTime = resolved.reduce((sum, incident) => {
      const reported = new Date(incident.reportedAt);
      const resolvedDate = new Date(incident.resolvedAt);
      return sum + (resolvedDate - reported);
    }, 0);

    return Math.round(totalTime / resolved.length / (1000 * 60 * 60)); // hours
  }

  // Resolve incident
  resolveIncident(incidentID, resolution, resolvedBy) {
    const incident = this.incidents.find(i => i.incidentID === incidentID);
    if (!incident) {
      throw new Error('Incident not found');
    }

    incident.status = 'Resolved';
    incident.resolvedAt = new Date().toISOString();
    incident.resolution = resolution;
    incident.resolvedBy = resolvedBy;

    // Unlock supplier if locked
    if (this.isSupplierLocked(incident.supplierID)) {
      this.unlockSupplier(incident.supplierID, `Incident ${incidentID} resolved`);
    }

    this.logAuditEvent('INCIDENT_RESOLVED', {
      incidentID,
      resolution,
      resolvedBy,
      resolvedAt: incident.resolvedAt
    });

    return incident;
  }

  // Get incident by ID
  getIncidentById(incidentID) {
    return this.incidents.find(i => i.incidentID === incidentID);
  }

  // Get report data for PDF generation
  getReportData(incidentID) {
    const incident = this.getIncidentById(incidentID);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const escalation = this.escalations.find(e => e.incidentID === incidentID);
    const relatedComplaints = this.complianceReports.filter(c => c.incidentID === incidentID);

    return {
      incident,
      escalation,
      complaints: relatedComplaints,
      auditTrail: this.auditLog.filter(a => 
        a.data.incidentID === incidentID || 
        a.data.escalationID === escalation?.escalationID
      )
    };
  }
}

module.exports = new ComplianceService();
