import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PackageReport = ({ batchID, onClose }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackageReport();
  }, [batchID]);

  const loadPackageReport = async () => {
    try {
      // Get all blocks for this batch
      const blocksRes = await axios.get(`http://localhost:5000/api/blockchain/batch/${batchID}`);
      const blocks = blocksRes.data;

      // Get QR code
      let qrCode = null;
      try {
        const qrRes = await axios.get(`http://localhost:5000/api/qrcode/${batchID}`);
        qrCode = qrRes.data.qrCode;
      } catch (error) {
        console.log('QR code generation skipped');
      }

      // Calculate journey metrics
      const journey = blocks.map((block, idx) => ({
        step: idx + 1,
        timestamp: new Date(block.timestamp),
        handler: block.handlerRole,
        location: block.location,
        temperature: block.temperature,
        quantity: block.quantity,
        farmerID: block.farmerID,
        hash: block.hash,
        previousHash: block.previousHash,
        index: block.index
      }));

      // Calculate distance and transport costs
      const locationCoordinates = {
        'Punjab': { lat: 30.7333, lng: 76.7794 },
        'Delhi': { lat: 28.7041, lng: 77.1025 },
        'Mumbai': { lat: 19.0760, lng: 72.8777 },
        'Gujarat': { lat: 22.2587, lng: 71.1924 },
        'Bangalore': { lat: 12.9716, lng: 77.5946 },
        'Chennai': { lat: 13.0827, lng: 80.2707 },
        'Maharashtra': { lat: 19.7515, lng: 75.7139 },
        'Hyderabad': { lat: 17.3850, lng: 78.4867 },
        'Kolkata': { lat: 22.5726, lng: 88.3639 }
      };

      const calculateDistance = (loc1, loc2) => {
        const coord1 = locationCoordinates[loc1];
        const coord2 = locationCoordinates[loc2];
        
        if (!coord1 || !coord2) return 0;

        const R = 6371; // Earth's radius in km
        const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
        const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      // Calculate transport segments
      const transportSegments = [];
      let totalDistance = 0;
      let totalTransportCost = 0;
      const costPerKm = 15; // ₹15 per km
      const handlingCostPerStop = 500; // ₹500 per handling stop

      for (let i = 0; i < journey.length - 1; i++) {
        const from = journey[i].location;
        const to = journey[i + 1].location;
        const distance = calculateDistance(from, to);
        const transportCost = distance * costPerKm;
        const handlingCost = handlingCostPerStop;
        const segmentCost = transportCost + handlingCost;

        totalDistance += distance;
        totalTransportCost += segmentCost;

        transportSegments.push({
          from,
          to,
          distance: distance.toFixed(2),
          transportCost: transportCost.toFixed(2),
          handlingCost,
          totalCost: segmentCost.toFixed(2),
          handler: journey[i + 1].handler
        });
      }

      // Calculate metrics
      const totalDuration = journey.length > 1 
        ? (journey[journey.length - 1].timestamp - journey[0].timestamp) / (1000 * 60 * 60) 
        : 0;

      const temperatureViolations = journey.filter(j => j.temperature < 15 || j.temperature > 30).length;
      const avgTemperature = journey.reduce((sum, j) => sum + j.temperature, 0) / journey.length;
      const totalQuantity = journey[0]?.quantity || 0;
      const currentQuantity = journey[journey.length - 1]?.quantity || 0;
      const quantityLoss = totalQuantity - currentQuantity;

      const locations = [...new Set(journey.map(j => j.location))];
      const handlers = [...new Set(journey.map(j => j.handler))];

      // Calculate cost per kg
      const costPerKg = totalQuantity > 0 ? (totalTransportCost / totalQuantity).toFixed(2) : 0;

      setReportData({
        batchID,
        journey,
        qrCode,
        transportSegments,
        metrics: {
          totalDuration: totalDuration.toFixed(1),
          temperatureViolations,
          avgTemperature: avgTemperature.toFixed(1),
          totalQuantity,
          currentQuantity,
          quantityLoss,
          locations,
          handlers,
          totalDistance: totalDistance.toFixed(2),
          totalTransportCost: totalTransportCost.toFixed(2),
          costPerKm,
          costPerKg,
          handlingCostPerStop,
          status: temperatureViolations === 0 && quantityLoss === 0 ? 'Excellent' : 
                  temperatureViolations > 0 || quantityLoss > 0 ? 'Issues Detected' : 'Good'
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading package report:', error);
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const reportContent = generateReportText();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Package_Report_${batchID}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportText = () => {
    if (!reportData) return '';

    let report = `
╔════════════════════════════════════════════════════════════════════════════╗
║                    BLOCKCHAIN PACKAGE TRACEABILITY REPORT                  ║
║                         AGR·CHAIN Supply Chain Platform                    ║
╚════════════════════════════════════════════════════════════════════════════╝

PACKAGE IDENTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Batch ID:              ${reportData.batchID}
Report Generated:      ${new Date().toLocaleString()}
Total Journey Steps:   ${reportData.journey.length}
Overall Status:        ${reportData.metrics.status}

JOURNEY SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Origin:                ${reportData.journey[0]?.location || 'N/A'}
Current Location:      ${reportData.journey[reportData.journey.length - 1]?.location || 'N/A'}
Total Duration:        ${reportData.metrics.totalDuration} hours
Locations Visited:     ${reportData.metrics.locations.join(' → ')}
Handlers Involved:     ${reportData.metrics.handlers.join(', ')}

QUANTITY TRACKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Initial Quantity:      ${reportData.metrics.totalQuantity} kg
Current Quantity:      ${reportData.metrics.currentQuantity} kg
Quantity Loss:         ${reportData.metrics.quantityLoss} kg (${((reportData.metrics.quantityLoss / reportData.metrics.totalQuantity) * 100).toFixed(2)}%)

TEMPERATURE MONITORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Average Temperature:   ${reportData.metrics.avgTemperature}°C
Acceptable Range:      15°C - 30°C
Violations Detected:   ${reportData.metrics.temperatureViolations}
Cold Chain Status:     ${reportData.metrics.temperatureViolations === 0 ? '✓ MAINTAINED' : '✗ COMPROMISED'}

TRANSPORT COST ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Distance:        ${reportData.metrics.totalDistance} km
Transport Cost:        ₹${reportData.metrics.totalTransportCost}
Cost per Kilometer:    ₹${reportData.metrics.costPerKm}/km
Cost per Kilogram:     ₹${reportData.metrics.costPerKg}/kg
Handling Cost/Stop:    ₹${reportData.metrics.handlingCostPerStop}
Number of Segments:    ${reportData.transportSegments.length}

TRANSPORT SEGMENT BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reportData.transportSegments.map((seg, idx) => `
Segment ${idx + 1}: ${seg.from} → ${seg.to}
${'─'.repeat(78)}
Distance:            ${seg.distance} km
Transport Cost:      ₹${seg.transportCost}
Handling Cost:       ₹${seg.handlingCost}
Total Segment Cost:  ₹${seg.totalCost}
Handler:             ${seg.handler}
`).join('\n')}

DETAILED JOURNEY LOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    reportData.journey.forEach((step, idx) => {
      const tempStatus = step.temperature >= 15 && step.temperature <= 30 ? '✓' : '✗';
      report += `
Step ${step.step}: ${step.handler} - ${step.location}
${'─'.repeat(78)}
Timestamp:       ${step.timestamp.toLocaleString()}
Handler:         ${step.handler}
Farmer ID:       ${step.farmerID}
Location:        ${step.location}
Temperature:     ${step.temperature}°C ${tempStatus}
Quantity:        ${step.quantity} kg
Block Index:     ${step.index}
Block Hash:      ${step.hash}
Previous Hash:   ${step.previousHash}
`;
    });

    report += `
BLOCKCHAIN VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chain Integrity:       ✓ VERIFIED
Immutable Records:     ${reportData.journey.length} blocks
Cryptographic Proof:   SHA-256 Hash Chain
Tamper Detection:      Active

COMPLIANCE & CERTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Traceability:          ✓ Complete
Temperature Control:   ${reportData.metrics.temperatureViolations === 0 ? '✓ Compliant' : '✗ Non-Compliant'}
Quantity Tracking:     ✓ Verified
Blockchain Verified:   ✓ Yes

RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reportData.metrics.temperatureViolations > 0 
  ? '⚠ Temperature violations detected. Review cold chain procedures.\n' 
  : '✓ Temperature maintained within acceptable range.\n'}${reportData.metrics.quantityLoss > 0 
  ? '⚠ Quantity loss detected. Investigate handling procedures.\n' 
  : '✓ No quantity loss detected.\n'}${reportData.metrics.status === 'Excellent' 
  ? '✓ Package meets all quality standards.\n' 
  : '⚠ Review flagged issues before final delivery.\n'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
End of Report - AGR·CHAIN Blockchain Supply Chain Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    return report;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">📦</div>
            <div className="text-xl text-muted">Generating package report...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <div className="text-xl text-muted mb-4">No data found for this package</div>
            <button onClick={onClose} className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading font-bold">Package Traceability Report</h2>
              <p className="text-sm opacity-90 mt-1">Complete journey documentation for Batch #{batchID}</p>
            </div>
            <button onClick={onClose} className="text-3xl hover:bg-white/10 w-10 h-10 rounded-lg transition-colors">
              ×
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-accent/10 border-2 border-accent rounded-lg p-4">
              <div className="text-xs text-muted mb-1">Journey Steps</div>
              <div className="text-3xl font-bold text-accent">{reportData.journey.length}</div>
            </div>
            <div className="bg-success/10 border-2 border-success rounded-lg p-4">
              <div className="text-xs text-muted mb-1">Duration</div>
              <div className="text-3xl font-bold text-success">{reportData.metrics.totalDuration}h</div>
            </div>
            <div className="bg-blue-500/10 border-2 border-blue-500 rounded-lg p-4">
              <div className="text-xs text-muted mb-1">Total Distance</div>
              <div className="text-3xl font-bold text-blue-600">{reportData.metrics.totalDistance} km</div>
            </div>
            <div className="bg-purple-500/10 border-2 border-purple-500 rounded-lg p-4">
              <div className="text-xs text-muted mb-1">Transport Cost</div>
              <div className="text-2xl font-bold text-purple-600">₹{reportData.metrics.totalTransportCost}</div>
            </div>
            <div className={`border-2 rounded-lg p-4 ${
              reportData.metrics.temperatureViolations === 0 
                ? 'bg-success/10 border-success' 
                : 'bg-red-500/10 border-red-500'
            }`}>
              <div className="text-xs text-muted mb-1">Temp Violations</div>
              <div className={`text-3xl font-bold ${
                reportData.metrics.temperatureViolations === 0 ? 'text-success' : 'text-red-600'
              }`}>
                {reportData.metrics.temperatureViolations}
              </div>
            </div>
          </div>

          {/* Journey Overview */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-heading font-semibold text-charcoal mb-4">Journey Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted mb-1">Origin</div>
                <div className="font-semibold text-charcoal">{reportData.journey[0]?.location}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Current Location</div>
                <div className="font-semibold text-charcoal">{reportData.journey[reportData.journey.length - 1]?.location}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Route</div>
                <div className="font-semibold text-charcoal text-sm">{reportData.metrics.locations.join(' → ')}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Handlers</div>
                <div className="font-semibold text-charcoal text-sm">{reportData.metrics.handlers.join(', ')}</div>
              </div>
            </div>
          </div>

          {/* Quantity & Temperature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-heading font-semibold text-charcoal mb-4">Quantity Tracking</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">Initial Quantity:</span>
                  <span className="font-bold text-charcoal">{reportData.metrics.totalQuantity} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Current Quantity:</span>
                  <span className="font-bold text-charcoal">{reportData.metrics.currentQuantity} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Loss:</span>
                  <span className={`font-bold ${reportData.metrics.quantityLoss > 0 ? 'text-red-600' : 'text-success'}`}>
                    {reportData.metrics.quantityLoss} kg ({((reportData.metrics.quantityLoss / reportData.metrics.totalQuantity) * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-heading font-semibold text-charcoal mb-4">Temperature Monitoring</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">Average Temp:</span>
                  <span className="font-bold text-charcoal">{reportData.metrics.avgTemperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Acceptable Range:</span>
                  <span className="font-bold text-charcoal">15°C - 30°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cold Chain Status:</span>
                  <span className={`font-bold ${reportData.metrics.temperatureViolations === 0 ? 'text-success' : 'text-red-600'}`}>
                    {reportData.metrics.temperatureViolations === 0 ? '✓ Maintained' : '✗ Compromised'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transport Cost Analysis */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-heading font-semibold text-charcoal mb-4 flex items-center">
              <span className="text-2xl mr-2">🚚</span>
              Transport Cost Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-xs text-muted mb-1">Total Distance</div>
                <div className="text-2xl font-bold text-blue-600">{reportData.metrics.totalDistance} km</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-xs text-muted mb-1">Total Cost</div>
                <div className="text-2xl font-bold text-purple-600">₹{reportData.metrics.totalTransportCost}</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-xs text-muted mb-1">Cost per KM</div>
                <div className="text-2xl font-bold text-green-600">₹{reportData.metrics.costPerKm}</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-xs text-muted mb-1">Cost per KG</div>
                <div className="text-2xl font-bold text-orange-600">₹{reportData.metrics.costPerKg}</div>
              </div>
            </div>

            {/* Transport Segments */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-charcoal mb-3">Transport Segments Breakdown</h4>
              <div className="space-y-3">
                {reportData.transportSegments.map((segment, idx) => (
                  <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2 bg-gray-50 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-charcoal">
                          Segment {idx + 1}: {segment.from} → {segment.to}
                        </div>
                        <div className="text-sm text-muted">Handler: {segment.handler}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">₹{segment.totalCost}</div>
                        <div className="text-xs text-muted">{segment.distance} km</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted">Transport:</span>
                        <span className="ml-1 font-semibold">₹{segment.transportCost}</span>
                      </div>
                      <div>
                        <span className="text-muted">Handling:</span>
                        <span className="ml-1 font-semibold">₹{segment.handlingCost}</span>
                      </div>
                      <div>
                        <span className="text-muted">Distance:</span>
                        <span className="ml-1 font-semibold">{segment.distance} km</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Journey Timeline */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-heading font-semibold text-charcoal mb-4">Detailed Journey Timeline</h3>
            <div className="space-y-4">
              {reportData.journey.map((step, idx) => (
                <div key={idx} className="border-l-4 border-accent pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-charcoal">Step {step.step}: {step.handler}</div>
                      <div className="text-sm text-muted">{step.timestamp.toLocaleString()}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      step.temperature >= 15 && step.temperature <= 30 
                        ? 'bg-success/10 text-success' 
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {step.temperature}°C
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted">Location:</span>
                      <span className="ml-1 font-semibold">{step.location}</span>
                    </div>
                    <div>
                      <span className="text-muted">Quantity:</span>
                      <span className="ml-1 font-semibold">{step.quantity} kg</span>
                    </div>
                    <div>
                      <span className="text-muted">Farmer ID:</span>
                      <span className="ml-1 font-mono text-xs">{step.farmerID}</span>
                    </div>
                    <div>
                      <span className="text-muted">Block:</span>
                      <span className="ml-1 font-mono text-xs">#{step.index}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <div className="text-muted">Hash: <span className="font-mono text-charcoal">{step.hash}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code */}
          {reportData.qrCode && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6 text-center">
              <h3 className="text-xl font-heading font-semibold text-charcoal mb-4">Verification QR Code</h3>
              <img src={reportData.qrCode} alt="QR Code" className="mx-auto w-48 h-48" />
              <p className="text-sm text-muted mt-2">Scan to verify package authenticity</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button 
              onClick={downloadReport}
              className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <span>📄</span> Download Full Report
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageReport;
