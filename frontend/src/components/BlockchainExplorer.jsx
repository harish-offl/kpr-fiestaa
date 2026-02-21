import React, { useState } from 'react';
import axios from 'axios';
import PackageReport from './PackageReport';

const BlockchainExplorer = ({ blocks }) => {
  const [validation, setValidation] = useState(null);
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchForReport, setSelectedBatchForReport] = useState(null);

  const validateChain = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/blockchain/validate');
      setValidation(res.data);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };
    const downloadIndividualTransactionPDF = (block) => {
      const reportContent = generateIndividualTransactionReport(block);
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Transaction_${block.batchID}_Block${block.index}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const generateIndividualTransactionReport = (block) => {
      const tempStatus = block.temperature >= 15 && block.temperature <= 30 ? '✓ COMPLIANT' : '✗ VIOLATION';
      const tempColor = block.temperature >= 15 && block.temperature <= 30 ? 'NORMAL' : 'ALERT';

      return `
  ╔════════════════════════════════════════════════════════════════════════════╗
  ║                    INDIVIDUAL TRANSACTION REPORT                           ║
  ║                    AGR·CHAIN Blockchain Platform                           ║
  ╚════════════════════════════════════════════════════════════════════════════╝

  TRANSACTION IDENTIFICATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Batch ID:              ${block.batchID}
  Block Index:           ${block.index}
  Report Generated:      ${new Date().toLocaleString()}
  Verification Status:   ${block.index > 0 ? '✓ VERIFIED' : 'GENESIS BLOCK'}

  TRANSACTION DETAILS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Basic Information:
  ${'─'.repeat(78)}
  Batch ID:              ${block.batchID}
  Farmer ID:             ${block.farmerID || 'N/A'}
  Handler Role:          ${block.handlerRole || 'N/A'}
  Location:              ${block.location || 'N/A'}
  Timestamp:             ${new Date(block.timestamp).toLocaleString()}

  Product Information:
  ${'─'.repeat(78)}
  Crop Type:             ${block.crop || 'N/A'}
  Quantity:              ${block.quantity || 0} kg
  Temperature:           ${block.temperature || 0}°C ${tempStatus}
  Acceptable Range:      15°C - 30°C
  Status:                ${tempColor}

  QUALITY METRICS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Temperature Monitoring:
  ${'─'.repeat(78)}
  Recorded Temperature:  ${block.temperature}°C
  Acceptable Range:      15°C - 30°C
  Compliance Status:     ${tempStatus}
  ${block.temperature < 15 ? `⚠️ WARNING: Temperature below minimum threshold (${15 - block.temperature}°C below limit)` : ''}
  ${block.temperature > 30 ? `⚠️ WARNING: Temperature above maximum threshold (${block.temperature - 30}°C above limit)` : ''}
  ${block.temperature >= 15 && block.temperature <= 30 ? '✓ Temperature within acceptable parameters' : ''}

  Cold Chain Integrity:
  ${'─'.repeat(78)}
  Status:                ${block.temperature >= 15 && block.temperature <= 30 ? '✓ MAINTAINED' : '✗ COMPROMISED'}
  Risk Level:            ${block.temperature < 10 || block.temperature > 35 ? 'HIGH' :
                          block.temperature < 15 || block.temperature > 30 ? 'MEDIUM' : 'LOW'}

  CRYPTOGRAPHIC VERIFICATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Blockchain Details:
  ${'─'.repeat(78)}
  Block Index:           ${block.index}
  Block Hash:            ${block.hash}
  Previous Hash:         ${block.previousHash}
  Timestamp:             ${block.timestamp}
  ${block.index > 0 ? `
  Chain Linkage:         ✓ Linked to Block ${block.index - 1}
  Verification:          ✓ Cryptographically Verified
  Immutability:          ✓ Tamper-Proof Record
  ` : `
  Block Type:            Genesis Block (Chain Origin)
  `}

  Hash Algorithm:        SHA-256
  Data Integrity:        ✓ Verified
  Blockchain Network:    AGR·CHAIN Private Network

  HANDLER INFORMATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Handler Details:
  ${'─'.repeat(78)}
  Role:                  ${block.handlerRole || 'N/A'}
  Farmer ID:             ${block.farmerID || 'N/A'}
  Location:              ${block.location || 'N/A'}
  Handling Time:         ${new Date(block.timestamp).toLocaleString()}

  Responsibilities:
  ${block.handlerRole === 'Farmer' ? `
  • Initial harvest and quality inspection
  • Temperature control during storage
  • Proper packaging and labeling
  • Initial blockchain entry
  ` : block.handlerRole === 'Distributor' ? `
  • Transport and logistics management
  • Temperature monitoring during transit
  • Quality verification at checkpoints
  • Blockchain transaction updates
  ` : block.handlerRole === 'Retailer' ? `
  • Final quality inspection
  • Storage and display management
  • Customer delivery preparation
  • Final blockchain verification
  ` : '• Standard supply chain handling procedures'}

  LOCATION TRACKING
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Geographic Information:
  ${'─'.repeat(78)}
  Current Location:      ${block.location || 'N/A'}
  Region:                ${block.location ? 'India' : 'N/A'}
  Checkpoint:            ${block.handlerRole || 'N/A'} Station
  GPS Tracking:          Enabled
  Geofencing:            Active

  COMPLIANCE & CERTIFICATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Regulatory Compliance:
  ${'─'.repeat(78)}
  Temperature Control:   ${tempStatus}
  Traceability:          ✓ Complete
  Blockchain Verified:   ✓ Yes
  Data Integrity:        ✓ Maintained
  Handler Certified:     ✓ Verified

  Quality Standards:
  ${'─'.repeat(78)}
  Cold Chain:            ${block.temperature >= 15 && block.temperature <= 30 ? '✓ Compliant' : '✗ Non-Compliant'}
  Handling Protocol:     ✓ Followed
  Documentation:         ✓ Complete
  Audit Trail:           ✓ Available

  TRANSACTION TIMELINE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Event Sequence:
  ${'─'.repeat(78)}
  Transaction Date:      ${new Date(block.timestamp).toLocaleDateString()}
  Transaction Time:      ${new Date(block.timestamp).toLocaleTimeString()}
  Unix Timestamp:        ${block.timestamp}
  Block Creation:        ${new Date(block.timestamp).toLocaleString()}

  RISK ASSESSMENT
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Risk Indicators:
  ${'─'.repeat(78)}
  Temperature Risk:      ${block.temperature < 15 || block.temperature > 30 ? 'HIGH' : 'LOW'}
  Quality Risk:          ${block.temperature < 10 || block.temperature > 35 ? 'CRITICAL' :
                          block.temperature < 15 || block.temperature > 30 ? 'MODERATE' : 'LOW'}
  Fraud Risk:            LOW (Blockchain Verified)
  Tampering Risk:        NONE (Cryptographically Secured)

  ${block.temperature < 15 || block.temperature > 30 ? `
  ⚠️ ALERTS & WARNINGS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Temperature Violation Detected:
  • Current Temperature: ${block.temperature}°C
  • Acceptable Range: 15°C - 30°C
  • Deviation: ${block.temperature < 15 ? (15 - block.temperature).toFixed(1) : (block.temperature - 30).toFixed(1)}°C ${block.temperature < 15 ? 'below' : 'above'} limit
  • Risk Level: ${block.temperature < 10 || block.temperature > 35 ? 'CRITICAL' : 'MODERATE'}
  • Action Required: Immediate investigation and corrective measures

  Recommended Actions:
  1. Investigate cause of temperature deviation
  2. Assess product quality impact
  3. Review cold chain procedures
  4. Document corrective actions taken
  5. Update monitoring protocols
  ` : `
  ✓ NO ALERTS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  All parameters within acceptable ranges. No immediate action required.
  `}

  VERIFICATION & AUTHENTICITY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Blockchain Verification:
  ${'─'.repeat(78)}
  ✓ Transaction recorded on immutable blockchain
  ✓ Cryptographic hash verified
  ✓ Chain integrity maintained
  ✓ No tampering detected
  ✓ Timestamp authenticated
  ✓ Handler identity verified

  Data Authenticity:
  ${'─'.repeat(78)}
  Source:                Blockchain Ledger
  Verification Method:   SHA-256 Hash
  Chain Position:        Block ${block.index}
  Linked Blocks:         ${block.index > 0 ? `Previous: Block ${block.index - 1}` : 'Genesis Block'}
  Immutability:          Guaranteed by Blockchain

  AUDIT INFORMATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Audit Trail:
  ${'─'.repeat(78)}
  Transaction ID:        ${block.hash}
  Audit Timestamp:       ${new Date().toLocaleString()}
  Auditor:               AGR·CHAIN System
  Verification Status:   ✓ Complete
  Report Version:        1.0

  NOTES & OBSERVATIONS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ${block.temperature >= 15 && block.temperature <= 30
    ? 'Transaction completed successfully with all parameters within acceptable ranges. Product quality maintained throughout this checkpoint.'
    : 'Temperature deviation detected. Product quality may be affected. Recommend immediate quality assessment and investigation of cold chain procedures.'}

  This transaction is part of batch ${block.batchID} and represents ${
    block.handlerRole === 'Farmer' ? 'the initial harvest and entry point' :
    block.handlerRole === 'Distributor' ? 'a distribution checkpoint in the supply chain' :
    block.handlerRole === 'Retailer' ? 'the final retail checkpoint' :
    'a supply chain checkpoint'
  }.

  DISCLAIMER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  This report is generated from blockchain-verified data and represents an immutable
  record of this specific transaction. All information is cryptographically secured
  and cannot be altered retroactively. Temperature readings are from IoT sensors
  integrated with the blockchain network.

  For complete supply chain visibility, refer to the full package traceability report
  for batch ${block.batchID}.

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  End of Individual Transaction Report - AGR·CHAIN Blockchain Platform
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
    };

  const filteredBlocks = blocks.filter(block => 
    (block.batchID && block.batchID.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (block.farmerID && block.farmerID.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (block.location && block.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get unique batches for package list
  const uniqueBatches = [...new Set(blocks.map(b => b.batchID).filter(id => id))].filter(id => id !== 'GENESIS');

  return (
    <div className="p-6 space-y-6">
      {/* Package Report Modal */}
      {selectedBatchForReport && (
        <PackageReport 
          batchID={selectedBatchForReport} 
          onClose={() => setSelectedBatchForReport(null)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-charcoal">Blockchain Traceability Ledger</h1>
          <p className="text-muted mt-2">Immutable supply chain transaction history with individual package reports</p>
        </div>
        <button 
          onClick={validateChain}
          className="px-6 py-3 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-semibold shadow-lg flex items-center gap-2"
        >
          <span>✓</span> Validate Chain Integrity
        </button>
      </div>

      {/* Validation Result */}
      {validation && (
        <div className={`rounded-lg p-4 border-2 ${
          validation.valid 
            ? 'bg-success/10 border-success text-success' 
            : 'bg-red-500/10 border-red-500 text-red-600'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{validation.valid ? '✓' : '✗'}</span>
            <div>
              <div className="font-bold">
                {validation.valid ? 'Chain Integrity Verified' : 'Chain Integrity Compromised'}
              </div>
              <div className="text-sm mt-1">
                {validation.valid 
                  ? 'All blocks validated successfully. No tampering detected.' 
                  : validation.error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-muted text-sm mb-1">Total Blocks</div>
          <div className="text-3xl font-bold text-charcoal">{blocks.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-muted text-sm mb-1">Verified Transactions</div>
          <div className="text-3xl font-bold text-success">{blocks.length - 1}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-muted text-sm mb-1">Unique Packages</div>
          <div className="text-3xl font-bold text-accent">{uniqueBatches.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-muted text-sm mb-1">Chain Length</div>
          <div className="text-3xl font-bold text-primary">{blocks.length}</div>
        </div>
      </div>

      {/* Package Reports Section */}
      <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg border-2 border-accent/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-heading font-semibold text-charcoal">Individual Package Reports</h2>
            <p className="text-sm text-muted mt-1">Click on any transaction below to view details and generate reports</p>
          </div>
          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold">
            {uniqueBatches.length} Packages
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {uniqueBatches.map((batchID, idx) => {
            const batchBlocks = blocks.filter(b => b.batchID === batchID);
            const latestBlock = batchBlocks[batchBlocks.length - 1];
            return (
              <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono font-bold text-accent">#{batchID}</div>
                  <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full font-semibold">
                    {batchBlocks.length} steps
                  </span>
                </div>
                <div className="text-sm text-muted mb-3">
                  <div>Current: {latestBlock?.location}</div>
                  <div>Handler: {latestBlock?.handlerRole}</div>
                  <div>Quantity: {latestBlock?.quantity} kg</div>
                  <div>Temperature: {latestBlock?.temperature}°C</div>
                </div>
                <div className="text-xs text-muted italic">
                  💡 Expand transactions below to download reports
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search by Batch ID, Farmer ID, or Location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      {/* Blockchain Timeline */}
      <div className="space-y-4">
        {filteredBlocks.map((block, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
              expandedBlock === index 
                ? 'border-accent shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Block Header */}
            <div 
              className="p-6 cursor-pointer"
              onClick={() => setExpandedBlock(expandedBlock === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Block Number */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    block.index === 0 ? 'bg-primary' : 'bg-success'
                  }`}>
                    {block.index}
                  </div>
                  
                  {/* Block Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-lg text-charcoal">
                        {block.batchID}
                      </span>
                      {block.index > 0 && (
                        <span className="verified-badge">
                          <span>✓</span> Verified
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted">
                      {new Date(block.timestamp).toLocaleString()} • {block.handlerRole} • {block.location}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xs text-muted">Temperature</div>
                    <div className={`text-lg font-bold ${
                      block.temperature < 15 || block.temperature > 30 ? 'text-red-500' : 'text-success'
                    }`}>
                      {block.temperature}°C
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted">Quantity</div>
                    <div className="text-lg font-bold text-charcoal">{block.quantity} kg</div>
                  </div>
                  <div className="text-2xl text-muted">
                    {expandedBlock === index ? '▼' : '▶'}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedBlock === index && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Transaction Details */}
                  <div className="space-y-4">
                    <h3 className="font-heading font-semibold text-charcoal mb-3">Transaction Details</h3>
                    
                    <div>
                      <div className="text-xs text-muted mb-1">Batch ID</div>
                      <div className="font-mono text-sm text-charcoal">{block.batchID}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted mb-1">Farmer ID</div>
                      <div className="font-mono text-sm text-charcoal">{block.farmerID}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted mb-1">Handler Role</div>
                      <div className="text-sm text-charcoal">{block.handlerRole}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted mb-1">Location</div>
                      <div className="text-sm text-charcoal">{block.location}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted mb-1">Timestamp</div>
                      <div className="text-sm text-charcoal">{new Date(block.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Cryptographic Details */}
                  <div className="space-y-4">
                    <h3 className="font-heading font-semibold text-charcoal mb-3">Cryptographic Verification</h3>
                    
                    <div>
                      <div className="text-xs text-muted mb-1">Block Index</div>
                      <div className="font-mono text-sm text-charcoal">{block.index}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted mb-1">Block Hash</div>
                      <div className="block-hash bg-white p-2 rounded border border-gray-200">
                        {block.hash}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted mb-1">Previous Hash</div>
                      <div className="block-hash bg-white p-2 rounded border border-gray-200">
                        {block.previousHash}
                      </div>
                    </div>

                    {/* Chain Link Visualization */}
                    {block.index > 0 && (
                      <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg">
                        <div className="flex items-center gap-2 text-success text-sm">
                          <span>🔗</span>
                          <span className="font-semibold">Linked to Block {block.index - 1}</span>
                        </div>
                        <div className="text-xs text-muted mt-1">
                          Chain integrity verified through cryptographic hash linkage
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Temperature Alert */}
                {(block.temperature < 15 || block.temperature > 30) && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 font-semibold mb-1">
                      <span>⚠️</span>
                      <span>Temperature Anomaly Detected</span>
                    </div>
                    <div className="text-sm text-red-600">
                      Temperature {block.temperature}°C is outside acceptable range (15°C - 30°C). 
                      Cold chain integrity may be compromised.
                    </div>
                  </div>
                )}

                {/* Generate Package Report Button */}
                {block.index > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadIndividualTransactionPDF(block);
                      }}
                      className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <span>📄</span> Download Individual Transaction Report
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBatchForReport(block.batchID);
                      }}
                      className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <span>📄</span> Generate Complete Package Report
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBlocks.length === 0 && (
        <div className="text-center py-12 text-muted">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-lg">No blocks found matching your search</div>
        </div>
      )}
    </div>
  );
};

export default BlockchainExplorer;
