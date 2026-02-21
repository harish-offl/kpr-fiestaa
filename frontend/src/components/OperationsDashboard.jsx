import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OperationsDashboard = () => {
  const [opsData, setOpsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadOperationsData();
    const interval = setInterval(() => {
      loadOperationsData();
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOperationsData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/operations/dashboard');
      setOpsData(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Operations data error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <div className="text-xl text-muted">Loading operations data...</div>
        </div>
      </div>
    );
  }

  if (!opsData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-xl text-muted">No operations data available</div>
        </div>
      </div>
    );
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-charcoal">Real-Time Operations Control Center</h1>
          <p className="text-muted mt-2">Live monitoring and logistics intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-charcoal">Live</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted">Last Update</div>
            <div className="text-sm font-semibold text-charcoal">{lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="metric-card border-l-4 border-accent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted text-sm font-medium">Active Shipments</span>
            <span className="text-3xl">🚚</span>
          </div>
          <div className="text-4xl font-bold text-accent mb-1">{opsData.kpis.activeShipmentsCount}</div>
          <div className="text-xs text-muted">In transit</div>
        </div>

        <div className="metric-card border-l-4 border-success">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted text-sm font-medium">On-Time Delivery</span>
            <span className="text-3xl">✓</span>
          </div>
          <div className="text-4xl font-bold text-success mb-1">{opsData.kpis.onTimeDeliveryPercent}%</div>
          <div className="text-xs text-muted">Performance rate</div>
        </div>

        <div className="metric-card border-l-4 border-warning">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted text-sm font-medium">Avg Delay</span>
            <span className="text-3xl">⏱️</span>
          </div>
          <div className="text-4xl font-bold text-warning mb-1">{opsData.kpis.avgDelayDuration}</div>
          <div className="text-xs text-muted">Hours</div>
        </div>

        <div className="metric-card border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted text-sm font-medium">Current SCRI</span>
            <span className="text-3xl">📊</span>
          </div>
          <div className="text-4xl font-bold text-red-500 mb-1">{opsData.kpis.currentSCRI}</div>
          <div className="text-xs text-muted">Risk index</div>
        </div>

        <div className="metric-card border-l-4 border-primary">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted text-sm font-medium">Demand Volatility</span>
            <span className="text-3xl">📈</span>
          </div>
          <div className="text-4xl font-bold text-primary mb-1">{opsData.kpis.demandVolatility}%</div>
          <div className="text-xs text-muted">Market variance</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Shipment Tracking */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold text-charcoal">Active Shipment Tracking</h2>
              <p className="text-sm text-muted mt-1">Real-time logistics monitoring</p>
            </div>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold">
              {opsData.activeShipments.length} Active
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {opsData.activeShipments.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <div className="text-4xl mb-2">📦</div>
                <div>No active shipments</div>
              </div>
            ) : (
              opsData.activeShipments.slice(0, 10).map((shipment, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-accent/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-mono font-bold text-accent text-lg">#{shipment.id}</div>
                      <div className="text-sm text-muted mt-1">
                        <span className="font-medium">{shipment.origin}</span> 
                        <span className="mx-2 text-accent">→</span> 
                        <span className="font-medium">{shipment.destination}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      shipment.delayStatus === 'On-Time' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {shipment.delayStatus}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted">Progress: <span className="font-semibold text-charcoal">{shipment.progress}%</span></span>
                      <span className="text-muted">Handler: <span className="font-semibold text-charcoal">{shipment.currentHandler}</span></span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          shipment.progress === 100 ? 'bg-success' : 'bg-accent'
                        }`}
                        style={{ width: `${shipment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className={`${shipment.temperature < 15 || shipment.temperature > 30 ? 'text-red-600 font-bold' : 'text-muted'}`}>
                      🌡️ {shipment.temperature}°C
                    </span>
                    <span className="text-muted">📦 {shipment.quantity} kg</span>
                    <span className="text-muted">⏰ {formatTime(shipment.estimatedDelivery)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Inventory Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold text-charcoal">Live Inventory Status</h2>
              <p className="text-sm text-muted mt-1">Warehouse stock levels</p>
            </div>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.keys(opsData.inventory).length === 0 ? (
              <div className="text-center py-12 text-muted">
                <div className="text-4xl mb-2">📊</div>
                <div>No inventory data</div>
              </div>
            ) : (
              Object.entries(opsData.inventory).map(([crop, data]) => (
                <div key={crop} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg text-charcoal">{crop}</h3>
                    <span className="text-3xl font-bold text-accent">{data.total}</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>Low: {data.lowStockThreshold}</span>
                      <span>High: {data.overstockThreshold}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          data.total < data.lowStockThreshold ? 'bg-red-500' :
                          data.total > data.overstockThreshold ? 'bg-warning' :
                          'bg-success'
                        }`}
                        style={{ width: `${Math.min((data.total / data.overstockThreshold) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted">Warehouse Distribution:</div>
                    {Object.entries(data.warehouses).map(([location, qty]) => (
                      <div key={location} className="flex justify-between text-sm bg-gray-50 px-2 py-1 rounded">
                        <span className="text-muted">{location}</span>
                        <span className="font-semibold text-charcoal">{qty} kg</span>
                      </div>
                    ))}
                  </div>

                  {data.total < data.lowStockThreshold && (
                    <div className="mt-3 bg-red-50 border border-red-300 rounded p-2 text-xs text-red-600 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Low stock alert - Reorder recommended</span>
                    </div>
                  )}
                  {data.total > data.overstockThreshold && (
                    <div className="mt-3 bg-warning/10 border border-warning/30 rounded p-2 text-xs text-warning flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Overstock alert - Storage capacity exceeded</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delay Monitoring Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold text-charcoal">Delay Monitoring</h2>
              <p className="text-sm text-muted mt-1">Shipment delays and mitigation</p>
            </div>
            <span className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-sm font-semibold">
              {opsData.delays.length} Delayed
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {opsData.delays.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <div className="text-4xl mb-2">✓</div>
                <div>No delays detected</div>
              </div>
            ) : (
              opsData.delays.map((delay, idx) => (
                <div key={idx} className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-mono font-bold text-charcoal">#{delay.batchID}</div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      delay.riskLevel === 'High' ? 'bg-red-500 text-white' : 'bg-warning text-white'
                    }`}>
                      {delay.riskLevel} Risk
                    </span>
                  </div>
                  <div className="text-sm text-charcoal mb-3">
                    ⏰ Delay Duration: <span className="font-bold">{delay.duration} hours</span>
                  </div>
                  <div className="bg-white rounded p-3 text-xs text-charcoal">
                    <div className="font-semibold mb-1 text-accent">💡 Suggested Mitigation:</div>
                    <div>{delay.mitigation}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Temperature Monitoring Stream */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold text-charcoal">Temperature Monitoring</h2>
              <p className="text-sm text-muted mt-1">Cold chain integrity tracking</p>
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {opsData.temperatureStream.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <div className="text-4xl mb-2">🌡️</div>
                <div>No temperature data</div>
              </div>
            ) : (
              opsData.temperatureStream.map((temp, idx) => (
                <div key={idx} className={`border-2 rounded-lg p-4 transition-all ${
                  temp.anomaly ? 'border-red-300 bg-red-50' : 'border-success/30 bg-success/5'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-mono font-bold text-charcoal">#{temp.batchID}</div>
                    <span className={`text-3xl font-bold ${
                      temp.anomaly ? 'text-red-600' : 'text-success'
                    }`}>
                      {temp.temperature}°C
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted mb-3">
                    <span>Range: {temp.acceptableRange.min}°C - {temp.acceptableRange.max}°C</span>
                    <span>{formatTimestamp(temp.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            temp.coldChainIntegrity >= 80 ? 'bg-success' :
                            temp.coldChainIntegrity >= 50 ? 'bg-warning' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${temp.coldChainIntegrity}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted mt-1">Cold Chain: {temp.coldChainIntegrity}%</div>
                    </div>
                    {temp.anomaly && (
                      <span className="text-red-600 font-bold text-sm">⚠️</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Supply Flow & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supply Flow Visualization */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal">Supply Flow Visualization</h2>
            <p className="text-sm text-muted mt-1">End-to-end supply chain network</p>
          </div>
          <div className="flex items-center justify-around py-8">
            {opsData.supplyFlow.nodes.map((node, idx) => (
              <div key={node.id} className="flex items-center">
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all hover:scale-110 ${
                    node.risk === 'low' ? 'bg-success' :
                    node.risk === 'medium' ? 'bg-warning' :
                    'bg-red-500'
                  }`}>
                    <div>
                      <div>{node.label}</div>
                      {opsData.supplyFlow.edges[idx] && (
                        <div className="text-xs mt-1">{opsData.supplyFlow.edges[idx].count}</div>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs mt-2 font-semibold ${
                    node.risk === 'low' ? 'text-success' :
                    node.risk === 'medium' ? 'text-warning' :
                    'text-red-500'
                  }`}>
                    {node.risk.toUpperCase()} RISK
                  </div>
                </div>
                {idx < opsData.supplyFlow.nodes.length - 1 && (
                  <div className="mx-6">
                    <div className="text-4xl text-accent">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-success/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-success">
                {opsData.supplyFlow.edges.reduce((sum, e) => sum + e.count, 0)}
              </div>
              <div className="text-xs text-muted mt-1">Total Flow</div>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-accent">
                {opsData.supplyFlow.nodes.filter(n => n.risk === 'low').length}
              </div>
              <div className="text-xs text-muted mt-1">Low Risk Nodes</div>
            </div>
            <div className="bg-warning/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-warning">
                {opsData.supplyFlow.nodes.filter(n => n.risk === 'medium' || n.risk === 'high').length}
              </div>
              <div className="text-xs text-muted mt-1">Risk Nodes</div>
            </div>
          </div>
        </div>

        {/* Live Alerts Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold text-charcoal">Live Alerts</h2>
              <p className="text-sm text-muted mt-1">System notifications</p>
            </div>
            <span className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-sm font-semibold">
              {opsData.alerts.length}
            </span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {opsData.alerts.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <div className="text-4xl mb-2">✓</div>
                <div>No alerts</div>
              </div>
            ) : (
              opsData.alerts.map((alert, idx) => (
                <div key={idx} className={`border-l-4 rounded-lg p-3 ${
                  alert.severity === 'danger' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'warning' ? 'border-warning bg-warning/10' :
                  'border-accent bg-accent/10'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-sm text-charcoal">{alert.type}</div>
                    <span className="text-xs text-muted">{formatTimestamp(alert.timestamp)}</span>
                  </div>
                  <div className="text-xs text-muted">{alert.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsDashboard;
