import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ComplianceDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeTab, setActiveTab] = useState('incidents');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintData, setComplaintData] = useState({
    complaintType: 'Quality Issue',
    description: '',
    submittedBy: 'System Administrator',
    requestedAction: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [incidentsRes, escalationsRes, auditRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/compliance/incidents'),
        axios.get('http://localhost:5000/api/compliance/escalations'),
        axios.get('http://localhost:5000/api/compliance/audit-log?limit=50'),
        axios.get('http://localhost:5000/api/compliance/stats')
      ]);

      setIncidents(incidentsRes.data);
      setEscalations(escalationsRes.data);
      setAuditLog(auditRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    }
  };

  const downloadPDF = async (incidentID) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/compliance/incident/${incidentID}/pdf`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `incident-${incidentID}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF report');
    }
  };

  const createEscalation = async (incidentID) => {
    try {
      await axios.post('http://localhost:5000/api/compliance/escalation/create', {
        incidentID,
        escalatedBy: 'System Administrator',
        notes: 'Manual escalation triggered from dashboard'
      });
      alert('Escalation created successfully');
      loadData();
    } catch (error) {
      console.error('Error creating escalation:', error);
      alert('Error creating escalation');
    }
  };

  const submitComplaint = async (incidentID) => {
    try {
      await axios.post('http://localhost:5000/api/compliance/complaint/submit', {
        incidentID,
        ...complaintData
      });
      alert('Complaint submitted successfully');
      setShowComplaintForm(false);
      setComplaintData({
        complaintType: 'Quality Issue',
        description: '',
        submittedBy: 'System Administrator',
        requestedAction: ''
      });
      loadData();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Error submitting complaint');
    }
  };

  const notifyAuthority = async (escalationID) => {
    try {
      await axios.post('http://localhost:5000/api/compliance/notify-authority', {
        escalationID,
        authorityType: 'Regulatory Authority'
      });
      alert('Authority notified successfully');
      loadData();
    } catch (error) {
      console.error('Error notifying authority:', error);
      alert('Error notifying authority');
    }
  };

  const resolveIncident = async (incidentID) => {
    const resolution = prompt('Enter resolution details:');
    if (!resolution) return;

    try {
      await axios.post(`http://localhost:5000/api/compliance/incident/${incidentID}/resolve`, {
        resolution,
        resolvedBy: 'System Administrator'
      });
      alert('Incident resolved successfully');
      loadData();
    } catch (error) {
      console.error('Error resolving incident:', error);
      alert('Error resolving incident');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-800 border-red-400',
      'High': 'bg-orange-100 text-orange-800 border-orange-400',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-400',
      'Low': 'bg-green-100 text-green-800 border-green-400'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-400';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Escalated': 'bg-red-500',
      'Reported': 'bg-yellow-500',
      'Resolved': 'bg-green-500',
      'Pending': 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <span className="text-4xl mr-3">🛡️</span>
          Compliance & Escalation Engine
        </h1>
        <p className="text-gray-600 mt-2">Automated regulatory compliance monitoring and incident management</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Incidents</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalIncidents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Critical</p>
            <p className="text-3xl font-bold text-red-600">{stats.criticalIncidents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">High Risk</p>
            <p className="text-3xl font-bold text-orange-600">{stats.highIncidents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Escalated</p>
            <p className="text-3xl font-bold text-purple-600">{stats.escalatedIncidents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Locked Suppliers</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.lockedSuppliers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Compliance Rate</p>
            <p className="text-3xl font-bold text-green-600">{stats.complianceRate}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
            <p className="text-gray-600 text-sm">Avg Resolution</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.averageResolutionTime}h</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'incidents'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🚨 Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('escalations')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'escalations'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚠️ Escalations ({escalations.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'audit'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📋 Audit Log ({auditLog.length})
          </button>
        </div>

        <div className="p-6">
          {/* Incidents Tab */}
          {activeTab === 'incidents' && (
            <div className="space-y-4">
              {incidents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-500 text-lg">No compliance incidents detected</p>
                  <p className="text-gray-400 text-sm mt-2">All operations within acceptable parameters</p>
                </div>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.incidentID}
                    className={`border-l-4 rounded-lg p-4 ${getSeverityColor(incident.severity)} cursor-pointer hover:shadow-lg transition-shadow`}
                    onClick={() => setSelectedIncident(selectedIncident?.incidentID === incident.incidentID ? null : incident)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-lg">{incident.incidentID}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </span>
                          <span className={`w-3 h-3 rounded-full ${getStatusColor(incident.status)}`}></span>
                          <span className="text-sm font-medium">{incident.status}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Batch ID</p>
                            <p className="font-semibold">{incident.batchID}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Supplier</p>
                            <p className="font-semibold">{incident.supplierID}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fraud Risk</p>
                            <p className="font-semibold text-red-600">{incident.fraudRisk.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">SCRI</p>
                            <p className="font-semibold text-orange-600">{incident.scri.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadPDF(incident.incidentID); }}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          📄 Download PDF
                        </button>
                        {incident.requiresEscalation && incident.status !== 'Escalated' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); createEscalation(incident.incidentID); }}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            ⚠️ Escalate
                          </button>
                        )}
                        {incident.status !== 'Resolved' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); resolveIncident(incident.incidentID); }}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            ✓ Resolve
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedIncident?.incidentID === incident.incidentID && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Findings */}
                          <div>
                            <h4 className="font-bold mb-2">🔍 Findings</h4>
                            <div className="space-y-2">
                              {incident.findings.map((finding, idx) => (
                                <div key={idx} className="bg-white bg-opacity-50 p-3 rounded">
                                  <p className="font-semibold text-sm">{finding.type} ({finding.severity})</p>
                                  <p className="text-xs mt-1">{finding.description}</p>
                                  <p className="text-xs text-gray-600 mt-1">Evidence: {finding.evidence}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div>
                            <h4 className="font-bold mb-2">💡 Recommendations</h4>
                            <ul className="space-y-1">
                              {incident.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Blockchain Hash */}
                        <div className="mt-4 bg-gray-800 text-white p-3 rounded">
                          <p className="text-xs font-semibold mb-1">Blockchain Report Hash:</p>
                          <p className="text-xs font-mono break-all">{incident.reportHash}</p>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => {
                              setShowComplaintForm(true);
                              setComplaintData({ ...complaintData, incidentID: incident.incidentID });
                            }}
                            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                          >
                            📝 Submit Complaint
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Escalations Tab */}
          {activeTab === 'escalations' && (
            <div className="space-y-4">
              {escalations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No escalations</p>
                </div>
              ) : (
                escalations.map((escalation) => (
                  <div key={escalation.escalationID} className="border border-orange-300 rounded-lg p-4 bg-orange-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{escalation.escalationID}</h3>
                        <p className="text-sm text-gray-600">Incident: {escalation.incidentID}</p>
                        <p className="text-sm text-gray-600">Severity: <span className="font-semibold">{escalation.severity}</span></p>
                        <p className="text-sm text-gray-600">Status: <span className="font-semibold">{escalation.status}</span></p>
                        <p className="text-sm text-gray-600">Escalated: {new Date(escalation.escalatedAt).toLocaleString()}</p>
                        {escalation.notes && <p className="text-sm mt-2 italic">{escalation.notes}</p>}
                      </div>
                      {!escalation.authorityNotified && (
                        <button
                          onClick={() => notifyAuthority(escalation.escalationID)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          🚨 Notify Authority
                        </button>
                      )}
                      {escalation.authorityNotified && (
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded font-semibold">
                          ✓ Authority Notified
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-2">
              {auditLog.map((entry) => (
                <div key={entry.auditID} className="border border-gray-200 rounded p-3 bg-gray-50 hover:bg-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{entry.eventType}</p>
                      <p className="text-xs text-gray-600">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                      {entry.hash.substring(0, 16)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Submit Compliance Complaint</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Complaint Type</label>
                <select
                  value={complaintData.complaintType}
                  onChange={(e) => setComplaintData({ ...complaintData, complaintType: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option>Quality Issue</option>
                  <option>Fraud Suspicion</option>
                  <option>Temperature Violation</option>
                  <option>Documentation Error</option>
                  <option>Delivery Delay</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={complaintData.description}
                  onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="4"
                  placeholder="Describe the issue in detail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Requested Action</label>
                <input
                  type="text"
                  value={complaintData.requestedAction}
                  onChange={(e) => setComplaintData({ ...complaintData, requestedAction: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="What action should be taken?"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => submitComplaint(complaintData.incidentID)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Submit Complaint
                </button>
                <button
                  onClick={() => setShowComplaintForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboard;
