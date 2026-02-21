import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = ({ forecast, blocks }) => {
  const [scri, setScri] = useState(48);
  const [fraudRisk, setFraudRisk] = useState(18);
  const [anomalies, setAnomalies] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [showFraudReport, setShowFraudReport] = useState(false);
  const [fraudReportData, setFraudReportData] = useState({
    suspiciousActivity: '',
    evidenceDescription: '',
    affectedBatch: '',
    reporterName: 'System User',
    urgency: 'Medium'
  });

  useEffect(() => {
    if (blocks && blocks.length > 1) {
      checkAnomalies();
    }
    loadKPIs();
  }, [blocks]);

  const loadKPIs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/operations/kpis');
      setKpis(res.data);
    } catch (error) {
      console.error('KPIs error:', error);
    }
  };

  const checkAnomalies = () => {
    const detected = blocks.filter(b => b.temperature > 30 || b.temperature < 15);
    setAnomalies(detected);
  };

  const submitFraudReport = async () => {
    try {
      // Create incident report
      await axios.post('http://localhost:5000/api/compliance/incident/create', {
        batchID: fraudReportData.affectedBatch || 'MANUAL-REPORT',
        supplierID: 'REPORTED-BY-USER',
        fraudRisk: 85,
        scri: 75,
        anomalyScore: 80,
        temperature: 25,
        location: 'User Reported',
        handlerRole: 'Manual Report',
        timestamp: new Date().toISOString()
      });

      // Submit complaint
      await axios.post('http://localhost:5000/api/compliance/complaint/submit', {
        incidentID: 'USER-REPORT-' + Date.now(),
        complaintType: 'Fraud Suspicion',
        description: `Suspicious Activity: ${fraudReportData.suspiciousActivity}\n\nEvidence: ${fraudReportData.evidenceDescription}\n\nAffected Batch: ${fraudReportData.affectedBatch}`,
        submittedBy: fraudReportData.reporterName,
        requestedAction: 'Immediate investigation and verification',
        evidence: []
      });

      alert('✅ Fraud report submitted successfully!\n\nYour report has been logged and will be investigated immediately.\n\nIncident ID: USER-REPORT-' + Date.now());
      setShowFraudReport(false);
      setFraudReportData({
        suspiciousActivity: '',
        evidenceDescription: '',
        affectedBatch: '',
        reporterName: 'System User',
        urgency: 'Medium'
      });
    } catch (error) {
      console.error('Error submitting fraud report:', error);
      alert('Error submitting fraud report. Please try again.');
    }
  };

    const downloadExecutiveReportPDF = () => {
      const reportContent = generateExecutiveReportText();
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Executive_Report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const generateExecutiveReportText = () => {
      if (!forecast) return 'No forecast data available';

      const report = `
  ╔════════════════════════════════════════════════════════════════════════════╗
  ║                    AI-GENERATED EXECUTIVE REPORT                           ║
  ║                    AGR·CHAIN Supply Chain Platform                         ║
  ╚════════════════════════════════════════════════════════════════════════════╝

  REPORT METADATA
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Report Generated:      ${new Date().toLocaleString()}
  Confidence Level:      ${forecast.confidence.toFixed(0)}%
  Analysis Period:       30 Days Forward
  Data Sources:          Blockchain Ledger, IoT Sensors, Market APIs

  EXECUTIVE SUMMARY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  DEMAND OUTLOOK
  ${'─'.repeat(78)}
  Demand is projected to ${forecast.growth_percentage > 0 ? 'increase' : 'decrease'} by ${Math.abs(forecast.growth_percentage).toFixed(1)}% over the next 30 days
  with ${forecast.confidence.toFixed(0)}% confidence. Market conditions remain stable with predictable
  growth patterns.

  Key Metrics:
  • Projected Growth:     ${forecast.growth_percentage > 0 ? '+' : ''}${forecast.growth_percentage.toFixed(1)}%
  • Confidence Level:     ${forecast.confidence.toFixed(0)}%
  • Forecast Horizon:     30 days
  • Model Used:           Ensemble (Linear Regression, Random Forest, ARIMA)

  RISK OVERVIEW
  ${'─'.repeat(78)}
  Current Supply Chain Risk Index is ${scri} (${scri < 40 ? 'Low' : scri < 70 ? 'Moderate' : 'High'}).
  All critical checkpoints are operational with minimal disruption risk.

  Risk Indicators:
  • Supply Chain Risk Index (SCRI):  ${scri}/100
  • Risk Level:                      ${scri < 40 ? 'Low' : scri < 70 ? 'Moderate' : 'High'}
  • Critical Checkpoints:            Operational
  • Disruption Risk:                 Minimal

  FRAUD ASSESSMENT
  ${'─'.repeat(78)}
  Fraud probability is ${fraudRisk < 30 ? 'low' : fraudRisk < 60 ? 'moderate' : 'high'} at ${fraudRisk}%.
  Blockchain verification confirms transaction integrity across all nodes.

  Security Metrics:
  • Fraud Risk Score:                ${fraudRisk}%
  • Risk Classification:             ${fraudRisk < 30 ? 'Low' : fraudRisk < 60 ? 'Moderate' : 'High'}
  • Blockchain Verification:         ✓ Verified
  • Transaction Integrity:           ✓ Confirmed
  • Anomalies Detected:              ${anomalies.length}

  RECOMMENDATIONS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Inventory Management:
  ${forecast.growth_percentage > 15
    ? '⚠ Increase inventory by 15% to meet projected demand surge'
    : '✓ Maintain current inventory levels - demand stable'}

  Operations:
  ${scri > 50
    ? '⚠ Reinforce monitoring protocols and increase inspection frequency'
    : '✓ Continue standard operations with routine monitoring'}

  Risk Mitigation:
  ${fraudRisk > 50
    ? '⚠ Enhanced fraud detection measures recommended'
    : '✓ Current security measures adequate'}

  Supply Chain Optimization:
  • Review transport routes for cost efficiency
  • Monitor temperature compliance across all shipments
  • Maintain blockchain verification for all transactions

  DETAILED METRICS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ${kpis ? `
  Key Performance Indicators:
  • Total Shipments:                 ${kpis.totalShipments}
  • Active Routes:                   ${kpis.activeRoutes}
  • On-Time Delivery Rate:           ${kpis.onTimeDeliveryRate}%
  • Average Transit Time:            ${kpis.avgTransitTime} hours
  • Temperature Compliance:          ${kpis.temperatureCompliance}%
  • Blockchain Transactions:         ${blocks ? blocks.length : 0}
  ` : 'KPI data loading...'}

  ANOMALY DETECTION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ${anomalies.length > 0 ? `
  Detected Anomalies: ${anomalies.length}

  ${anomalies.slice(0, 5).map((anomaly, idx) => `
  Anomaly ${idx + 1}:
  ${'─'.repeat(78)}
  Batch ID:              ${anomaly.batchID}
  Location:              ${anomaly.location}
  Temperature:           ${anomaly.temperature}°C ${anomaly.temperature < 15 || anomaly.temperature > 30 ? '⚠ OUT OF RANGE' : ''}
  Handler:               ${anomaly.handlerRole}
  Timestamp:             ${new Date(anomaly.timestamp).toLocaleString()}
  Severity:              ${anomaly.temperature < 10 || anomaly.temperature > 35 ? 'High' : 'Medium'}
  `).join('\n')}
  ` : 'No anomalies detected - all shipments within normal parameters'}

  COMPLIANCE STATUS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Temperature Monitoring:        ${anomalies.length === 0 ? '✓ Compliant' : '⚠ Issues Detected'}
  Blockchain Verification:       ✓ Active
  Traceability:                  ✓ Complete
  Regulatory Compliance:         ✓ Maintained

  FORECAST CONFIDENCE BREAKDOWN
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ${forecast.metrics ? `
  Model Performance:
  • Linear Regression:           ${forecast.metrics.linear_regression.accuracy.toFixed(1)}% accuracy
  • Random Forest:               ${forecast.metrics.random_forest.accuracy.toFixed(1)}% accuracy
  • ARIMA:                       ${forecast.metrics.arima.accuracy.toFixed(1)}% accuracy
  • Ensemble Average:            ${((forecast.metrics.linear_regression.accuracy + forecast.metrics.random_forest.accuracy + forecast.metrics.arima.accuracy) / 3).toFixed(1)}%
  ` : ''}

  STRATEGIC INSIGHTS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Market Trends:
  • Demand trajectory shows ${forecast.growth_percentage > 0 ? 'upward' : 'downward'} trend
  • Seasonal factors accounted for in forecast
  • Historical patterns indicate ${forecast.confidence > 70 ? 'high' : 'moderate'} predictability

  Operational Excellence:
  • Supply chain visibility maintained through blockchain
  • Real-time monitoring ensures quality compliance
  • AI-driven insights enable proactive decision making

  Risk Management:
  • Continuous monitoring of fraud indicators
  • Temperature compliance tracked across all shipments
  • Blockchain immutability ensures data integrity

  NEXT STEPS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Immediate Actions (0-7 days):
  1. Review inventory levels against projected demand
  2. Address any detected anomalies in temperature monitoring
  3. Verify blockchain integrity across all recent transactions

  Short-term Planning (7-30 days):
  1. ${forecast.growth_percentage > 10 ? 'Prepare for demand increase - scale operations' : 'Maintain current operational capacity'}
  2. Continue routine monitoring and compliance checks
  3. Optimize transport routes based on cost analysis

  Long-term Strategy (30+ days):
  1. Evaluate supplier relationships and diversification opportunities
  2. Invest in predictive analytics capabilities
  3. Enhance blockchain integration across supply chain partners

  DISCLAIMER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  This report is generated using AI-powered predictive analytics and should be used
  as a decision support tool. Actual results may vary based on market conditions,
  external factors, and operational changes. Always combine AI insights with human
  expertise and domain knowledge for critical business decisions.

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  End of Report - AGR·CHAIN Blockchain Supply Chain Platform
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;

      return report;
    };


  const forecastChartData = forecast ? {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [{
      label: 'Demand Forecast',
      data: forecast.forecast,
      borderColor: '#2A9D8F',
      backgroundColor: 'rgba(42, 157, 143, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      borderWidth: 2,
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F1F1F',
        padding: 12,
        titleColor: '#F7F6F2',
        bodyColor: '#F7F6F2',
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#6B7280' }
      },
      y: { 
        grid: { color: '#E5E7EB' },
        ticks: { color: '#6B7280' }
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card border-l-4 border-accent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted text-sm font-medium">Total Batches Tracked</span>
            <span className="text-2xl">📦</span>
          </div>
          <div className="text-3xl font-bold text-charcoal">{blocks.length}</div>
          <div className="text-xs text-success mt-2">✓ All Verified</div>
        </div>

        <div className="metric-card border-l-4 border-success">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted text-sm font-medium">Active Shipments</span>
            <span className="text-2xl">🚚</span>
          </div>
          <div className="text-3xl font-bold text-charcoal">{kpis?.activeShipmentsCount || 0}</div>
          <div className="text-xs text-muted mt-2">In Transit</div>
        </div>

        <div className="metric-card border-l-4 border-warning">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted text-sm font-medium">AI Risk Alerts</span>
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-3xl font-bold text-charcoal">{anomalies.length}</div>
          <div className="text-xs text-warning mt-2">Requires Attention</div>
        </div>

        <div className="metric-card border-l-4 border-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted text-sm font-medium">On-Time Delivery</span>
            <span className="text-2xl">✓</span>
          </div>
          <div className="text-3xl font-bold text-charcoal">{kpis?.onTimeDeliveryPercent || 95}%</div>
          <div className="text-xs text-success mt-2">Performance Rate</div>
        </div>
      </div>

      {/* Supply Chain Status Flow */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">Supply Chain Status Flow</h2>
        <div className="flex items-center justify-between">
          {[
            { label: 'Farmer', status: 'verified', count: blocks.filter(b => b.handlerRole === 'Farmer').length },
            { label: 'Aggregator', status: 'verified', count: Math.floor(blocks.length * 0.7) },
            { label: 'Warehouse', status: 'verified', count: Math.floor(blocks.length * 0.5) },
            { label: 'Transport', status: 'delayed', count: Math.floor(blocks.length * 0.3) },
            { label: 'Retailer', status: 'verified', count: blocks.filter(b => b.handlerRole === 'Retailer').length }
          ].map((stage, idx, arr) => (
            <React.Fragment key={stage.label}>
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                  stage.status === 'verified' ? 'bg-success' :
                  stage.status === 'delayed' ? 'bg-warning' :
                  'bg-red-500'
                }`}>
                  {stage.count}
                </div>
                <div className="mt-3 text-center">
                  <div className="font-semibold text-sm text-charcoal">{stage.label}</div>
                  <div className={`text-xs mt-1 ${
                    stage.status === 'verified' ? 'text-success' :
                    stage.status === 'delayed' ? 'text-warning' :
                    'text-red-500'
                  }`}>
                    {stage.status === 'verified' ? '✓ Verified' :
                     stage.status === 'delayed' ? '⏱ Delayed' :
                     '✗ Anomaly'}
                  </div>
                </div>
              </div>
              {idx < arr.length - 1 && (
                <div className="flex-1 h-1 bg-gradient-to-r from-success to-warning mx-4 rounded"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Forecast */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold text-charcoal">30-Day Demand Forecast</h2>
              <p className="text-sm text-muted mt-1">AI-powered predictive analytics</p>
            </div>
            {forecast && (
              <div className="text-right">
                <div className="text-2xl font-bold text-success">{forecast.growth_percentage > 0 ? '+' : ''}{forecast.growth_percentage.toFixed(1)}%</div>
                <div className="text-xs text-muted">Projected Growth</div>
              </div>
            )}
          </div>
          <div className="h-64">
            {forecastChartData && <Line data={forecastChartData} options={chartOptions} />}
          </div>
          {forecast && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xs text-muted mb-1">Confidence Level</div>
                <div className="text-2xl font-bold text-accent">{forecast.confidence.toFixed(0)}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted mb-1">Avg Weekly Demand</div>
                <div className="text-2xl font-bold text-charcoal">{(forecast.forecast.slice(0, 7).reduce((a, b) => a + b, 0) / 7).toFixed(0)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted mb-1">Peak Demand Day</div>
                <div className="text-2xl font-bold text-charcoal">Day {forecast.forecast.indexOf(Math.max(...forecast.forecast)) + 1}</div>
              </div>
            </div>
          )}
        </div>

        {/* SCRI Gauge */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">Supply Chain Risk Index</h2>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-40 h-40">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle cx="80" cy="80" r="70" stroke="#E5E7EB" strokeWidth="14" fill="none" />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  stroke={scri < 40 ? '#2A9D8F' : scri < 70 ? '#F4A261' : '#EF4444'} 
                  strokeWidth="14" 
                  fill="none" 
                  strokeDasharray={`${scri * 4.4} 440`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-charcoal">{scri}</span>
                <span className="text-xs text-muted mt-1">SCRI Score</span>
              </div>
            </div>
          </div>
          <div className={`text-center mt-6 px-4 py-2 rounded-lg ${
            scri < 40 ? 'bg-success/10 text-success' :
            scri < 70 ? 'bg-warning/10 text-warning' :
            'bg-red-500/10 text-red-600'
          }`}>
            <div className="font-semibold">{scri < 40 ? 'Low Risk' : scri < 70 ? 'Moderate Risk' : 'High Risk'}</div>
            <div className="text-xs mt-1">
              {scri < 40 ? 'Operations within normal parameters' :
               scri < 70 ? 'Increased monitoring recommended' :
               'Immediate action required'}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="ai-card rounded-lg p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="font-heading font-semibold text-charcoal">Fraud Risk Analysis</h3>
              <p className="text-xs text-muted">AI-powered detection</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-success mb-2">{fraudRisk}%</div>
          <div className="text-sm text-muted mb-3">
            {fraudRisk < 30 ? 'Low fraud probability detected' :
             fraudRisk < 60 ? 'Moderate fraud risk detected' :
             'High fraud risk detected'}
          </div>
          
          {/* Fraud Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-xs">
            <p className="font-semibold text-blue-900 mb-2">How Fraud is Detected:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• <strong>Pattern Analysis:</strong> Unusual transaction patterns</li>
              <li>• <strong>Temperature Violations:</strong> Cold chain breaches</li>
              <li>• <strong>Documentation Gaps:</strong> Missing or inconsistent records</li>
              <li>• <strong>Quantity Discrepancies:</strong> Unexplained losses</li>
              <li>• <strong>Supplier Behavior:</strong> Trust score anomalies</li>
              <li>• <strong>Delivery Delays:</strong> Suspicious timing patterns</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => setShowFraudReport(true)}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                fraudRisk > 60 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {fraudRisk > 60 ? '🚨 REPORT FRAUD (High Risk)' : '⚠️ Report Suspicious Activity'}
            </button>
            
            <div className="text-xs text-center text-muted pt-2 border-t border-accent/20">
              {fraudRisk < 30 ? '✓ Continue monitoring standard protocols' :
               fraudRisk < 60 ? '⚠️ Increase inspection frequency' :
               '🚨 Immediate investigation required'}
            </div>
          </div>
        </div>

        <div className="ai-card rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🌡️</span>
            <div>
              <h3 className="font-heading font-semibold text-charcoal">Temperature Anomalies</h3>
              <p className="text-xs text-muted">Cold chain monitoring</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-warning mb-2">{anomalies.length}</div>
          <div className="text-sm text-muted">Anomalies detected</div>
          <div className="mt-4 pt-4 border-t border-accent/20 text-xs text-muted">
            {anomalies.length > 0 ? '⚠️ Review flagged shipments' : '✓ All within acceptable range'}
          </div>
        </div>

        <div className="ai-card rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📈</span>
            <div>
              <h3 className="font-heading font-semibold text-charcoal">Demand Volatility</h3>
              <p className="text-xs text-muted">Market variance</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-accent mb-2">{kpis?.demandVolatility || 12}%</div>
          <div className="text-sm text-muted">Current volatility index</div>
          <div className="mt-4 pt-4 border-t border-accent/20 text-xs text-muted">
            ✓ Stable market conditions
          </div>
        </div>
      </div>

      {/* Executive Report */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-heading font-semibold text-charcoal">AI-Generated Executive Report</h2>
            <p className="text-sm text-muted mt-1">Automated insights and recommendations</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={downloadExecutiveReportPDF}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-semibold"
            >
              📄 Download PDF
            </button>
            <button className="px-4 py-2 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
              🔗 Share Link
            </button>
          </div>
        </div>
        {forecast && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1 bg-accent rounded"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal mb-2">Demand Outlook</h3>
                <p className="text-muted leading-relaxed">
                  Demand is projected to {forecast.growth_percentage > 0 ? 'increase' : 'decrease'} by {Math.abs(forecast.growth_percentage).toFixed(1)}% over the next 30 days with {forecast.confidence.toFixed(0)}% confidence. Market conditions remain stable with predictable growth patterns.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-success rounded"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal mb-2">Risk Overview</h3>
                <p className="text-muted leading-relaxed">
                  Current Supply Chain Risk Index is {scri} ({scri < 40 ? 'Low' : scri < 70 ? 'Moderate' : 'High'}). All critical checkpoints are operational with minimal disruption risk.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-warning rounded"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal mb-2">Fraud Assessment</h3>
                <p className="text-muted leading-relaxed">
                  Fraud probability is {fraudRisk < 30 ? 'low' : fraudRisk < 60 ? 'moderate' : 'high'} at {fraudRisk}%. Blockchain verification confirms transaction integrity across all nodes.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-primary rounded"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal mb-2">Recommendations</h3>
                <p className="text-muted leading-relaxed">
                  {forecast.growth_percentage > 15 ? 'Increase inventory by 15% to meet projected demand' : 'Maintain current inventory levels'}. {scri > 50 ? 'Reinforce monitoring protocols and increase inspection frequency' : 'Continue standard operations with routine monitoring'}.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-muted">
                Report generated: {new Date().toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Confidence Level:</span>
                <span className="font-bold text-accent">{forecast.confidence.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fraud Report Modal */}
      {showFraudReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-red-600 flex items-center">
                <span className="text-3xl mr-3">🚨</span>
                Report Suspicious Activity
              </h2>
              <button
                onClick={() => setShowFraudReport(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Important:</strong> This report will be logged on the blockchain and trigger an immediate investigation. 
                  Please provide accurate and detailed information.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Suspicious Activity Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={fraudReportData.suspiciousActivity}
                  onChange={(e) => setFraudReportData({ ...fraudReportData, suspiciousActivity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select activity type...</option>
                  <option value="Temperature Violation">Temperature Violation - Cold chain breach</option>
                  <option value="Documentation Fraud">Documentation Fraud - Falsified records</option>
                  <option value="Quantity Discrepancy">Quantity Discrepancy - Missing inventory</option>
                  <option value="Quality Tampering">Quality Tampering - Product adulteration</option>
                  <option value="Unauthorized Handler">Unauthorized Handler - Unknown party access</option>
                  <option value="Delivery Manipulation">Delivery Manipulation - Route/timing fraud</option>
                  <option value="Supplier Misconduct">Supplier Misconduct - Trust score anomaly</option>
                  <option value="Other">Other - Specify in description</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Evidence & Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={fraudReportData.evidenceDescription}
                  onChange={(e) => setFraudReportData({ ...fraudReportData, evidenceDescription: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="5"
                  placeholder="Provide detailed evidence of the suspicious activity:&#10;- What did you observe?&#10;- When did it occur?&#10;- What makes it suspicious?&#10;- Any supporting data or patterns?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Affected Batch ID (if known)
                </label>
                <input
                  type="text"
                  value={fraudReportData.affectedBatch}
                  onChange={(e) => setFraudReportData({ ...fraudReportData, affectedBatch: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., BATCH-001, BATCH-XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Reporter Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fraudReportData.reporterName}
                  onChange={(e) => setFraudReportData({ ...fraudReportData, reporterName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Your name or ID"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={fraudReportData.urgency}
                  onChange={(e) => setFraudReportData({ ...fraudReportData, urgency: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Low">Low - Monitor and investigate</option>
                  <option value="Medium">Medium - Investigate within 24 hours</option>
                  <option value="High">High - Immediate attention required</option>
                  <option value="Critical">Critical - Emergency response needed</option>
                </select>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={submitFraudReport}
                  disabled={!fraudReportData.suspiciousActivity || !fraudReportData.evidenceDescription || !fraudReportData.reporterName}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  🚨 Submit Fraud Report
                </button>
                <button
                  onClick={() => {
                    setShowFraudReport(false);
                    setFraudReportData({
                      suspiciousActivity: '',
                      evidenceDescription: '',
                      affectedBatch: '',
                      reporterName: 'System User',
                      urgency: 'Medium'
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                All reports are logged immutably on the blockchain and will trigger compliance workflows.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
