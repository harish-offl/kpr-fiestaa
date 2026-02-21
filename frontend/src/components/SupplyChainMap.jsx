import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom SVG icons for each supply chain stage
const createCustomIcon = (emoji, color, status = 'safe') => {
  const statusColors = {
    safe: '#2A9D8F',
    delay: '#F4A261',
    risk: '#E63946'
  };
  
  const badgeColor = statusColors[status] || statusColors.safe;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: 48px; height: 48px;">
        <div style="
          width: 48px;
          height: 48px;
          background: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">${emoji}</div>
        <div style="
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background: ${badgeColor};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        "></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
  });
};

// Sample supply chain locations with realistic coordinates
const generateSupplyChainData = () => {
  return [
    {
      id: 'order-001',
      batchID: 'BATCH-2024-001',
      product: 'Rice',
      quantity: 500,
      locations: [
        {
          stage: 'farm',
          name: 'Green Valley Farm',
          coords: [11.0168, 76.9558],
          handler: 'Farmer Kumar',
          timestamp: '2024-02-18 08:00',
          blockHash: '0x7a8f9b2c...',
          temperature: 28,
          status: 'safe',
          qualityScore: 98
        },
        {
          stage: 'warehouse',
          name: 'Central Warehouse',
          coords: [11.1271, 77.3478],
          handler: 'Warehouse Manager',
          timestamp: '2024-02-18 14:30',
          blockHash: '0x3d4e5f6a...',
          temperature: 22,
          status: 'safe',
          qualityScore: 97
        },
        {
          stage: 'distributor',
          name: 'Regional Distribution Hub',
          coords: [13.0827, 80.2707],
          handler: 'Distributor Singh',
          timestamp: '2024-02-19 10:15',
          blockHash: '0x9c8d7e6f...',
          temperature: 25,
          status: 'safe',
          qualityScore: 96
        },
        {
          stage: 'retailer',
          name: 'City Market Store',
          coords: [13.0569, 80.2425],
          handler: 'Retailer Patel',
          timestamp: '2024-02-19 18:45',
          blockHash: '0x1a2b3c4d...',
          temperature: 24,
          status: 'safe',
          qualityScore: 95
        },
        {
          stage: 'consumer',
          name: 'Consumer Delivery Point',
          coords: [13.0475, 80.2175],
          handler: 'Delivery Agent',
          timestamp: '2024-02-20 09:30',
          blockHash: '0x5e6f7g8h...',
          temperature: 26,
          status: 'safe',
          qualityScore: 95
        }
      ],
      currentStage: 3,
      overallRisk: 'low',
      estimatedDelivery: '2024-02-20 12:00'
    },
    {
      id: 'order-002',
      batchID: 'BATCH-2024-002',
      product: 'Wheat',
      quantity: 750,
      locations: [
        {
          stage: 'farm',
          name: 'Sunrise Farm',
          coords: [10.9601, 76.9544],
          handler: 'Farmer Reddy',
          timestamp: '2024-02-17 07:00',
          blockHash: '0x8b9c0d1e...',
          temperature: 32,
          status: 'delay',
          qualityScore: 88
        },
        {
          stage: 'warehouse',
          name: 'North Warehouse',
          coords: [11.2588, 77.7081],
          handler: 'Warehouse Staff',
          timestamp: '2024-02-17 16:00',
          blockHash: '0x2f3g4h5i...',
          temperature: 35,
          status: 'risk',
          qualityScore: 82
        },
        {
          stage: 'distributor',
          name: 'Express Logistics',
          coords: [12.9716, 77.5946],
          handler: 'Distributor Khan',
          timestamp: '2024-02-18 11:30',
          blockHash: '0x6j7k8l9m...',
          temperature: 31,
          status: 'delay',
          qualityScore: 85
        }
      ],
      currentStage: 2,
      overallRisk: 'high',
      estimatedDelivery: '2024-02-21 15:00'
    }
  ];
};

const SupplyChainMap = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const data = generateSupplyChainData();
    setOrders(data);
    if (data.length > 0) {
      setSelectedOrder(data[0]);
    }
  }, []);

  const getStageConfig = (stage) => {
    const configs = {
      farm: { emoji: '🌱', color: '#2A9D8F', label: 'Farm Origin' },
      warehouse: { emoji: '🏭', color: '#1C2541', label: 'Warehouse' },
      distributor: { emoji: '🚚', color: '#7209B7', label: 'In Transit' },
      retailer: { emoji: '🏪', color: '#F4A261', label: 'Retail Store' },
      consumer: { emoji: '👤', color: '#3EC1D3', label: 'Consumer' }
    };
    return configs[stage] || configs.farm;
  };

  const getRouteColor = (risk) => {
    const colors = {
      low: '#2A9D8F',
      medium: '#F4A261',
      high: '#E63946'
    };
    return colors[risk] || colors.low;
  };

  const getRiskScore = (locations) => {
    const avgTemp = locations.reduce((sum, loc) => sum + loc.temperature, 0) / locations.length;
    if (avgTemp > 30 || avgTemp < 15) return 'high';
    if (avgTemp > 28 || avgTemp < 18) return 'medium';
    return 'low';
  };

  if (!selectedOrder) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🗺️</div>
          <div className="text-xl text-muted">Loading supply chain map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[12.0, 77.5]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {selectedOrder.locations.map((location, idx) => {
            const config = getStageConfig(location.stage);
            const icon = createCustomIcon(config.emoji, config.color, location.status);

            return (
              <React.Fragment key={`marker-${idx}`}>
                <Marker position={location.coords} icon={icon}>
                  <Popup>
                    <div className="p-2 min-w-[250px]">
                      <div className="font-bold text-primary mb-2">{config.label}</div>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-semibold">Location:</span> {location.name}</div>
                        <div><span className="font-semibold">Handler:</span> {location.handler}</div>
                        <div><span className="font-semibold">Time:</span> {location.timestamp}</div>
                        <div>
                          <span className="font-semibold">Temperature:</span> 
                          <span className={location.temperature > 30 || location.temperature < 15 ? 'text-red-600 font-bold' : 'text-green-600'}>
                            {' '}{location.temperature}°C
                          </span>
                        </div>
                        <div><span className="font-semibold">Quality:</span> {location.qualityScore}%</div>
                        <div className="pt-2 border-t mt-2">
                          <div className="font-mono text-xs text-gray-600">
                            Block: {location.blockHash}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {idx < selectedOrder.locations.length - 1 && (
                  <Polyline
                    key={`line-${idx}`}
                    positions={[
                      location.coords,
                      selectedOrder.locations[idx + 1].coords
                    ]}
                    pathOptions={{
                      color: getRouteColor(selectedOrder.overallRisk),
                      weight: 4,
                      opacity: 0.7,
                      dashArray: idx >= selectedOrder.currentStage ? '10, 10' : undefined
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-[1000] space-y-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-4 py-2 rounded-lg shadow-lg font-semibold transition-all ${
              showHeatmap 
                ? 'bg-accent text-white' 
                : 'bg-white text-charcoal hover:bg-gray-50'
            }`}
          >
            {showHeatmap ? '🗺️ Hide' : '🔥 Show'} Risk Heatmap
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
          <div className="font-bold text-sm mb-2 text-charcoal">Supply Chain Stages</div>
          <div className="space-y-2 text-xs">
            {['farm', 'warehouse', 'distributor', 'retailer', 'consumer'].map(stage => {
              const config = getStageConfig(stage);
              return (
                <div key={stage} className="flex items-center gap-2">
                  <span className="text-lg">{config.emoji}</span>
                  <span className="text-muted">{config.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="font-bold text-sm mb-2 text-charcoal">Status</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-muted">Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-muted">Delay Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-muted">High Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Side Panel */}
      <div className="w-[30%] bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-heading font-bold text-primary mb-4">
            📦 Order Tracking
          </h2>

          {/* Order Selection */}
          <div className="space-y-3 mb-6">
            {orders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedOrder?.id === order.id
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-accent/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-charcoal">{order.batchID}</div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    order.overallRisk === 'low' ? 'bg-green-100 text-green-800' :
                    order.overallRisk === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.overallRisk.toUpperCase()} RISK
                  </div>
                </div>
                <div className="text-sm text-muted">
                  {order.product} • {order.quantity} kg
                </div>
                <div className="text-xs text-muted mt-1">
                  Stage {order.currentStage + 1} of {order.locations.length}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Order Details */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-secondary text-white p-4 rounded-lg">
              <div className="text-sm opacity-80 mb-1">Current Status</div>
              <div className="text-xl font-bold">
                {getStageConfig(selectedOrder.locations[selectedOrder.currentStage].stage).label}
              </div>
              <div className="text-sm mt-2 opacity-90">
                ETA: {selectedOrder.estimatedDelivery}
              </div>
            </div>

            {/* Blockchain Verification */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✓</span>
                <span className="font-semibold text-green-800">Blockchain Verified</span>
              </div>
              <div className="text-xs font-mono text-green-700">
                {selectedOrder.locations[selectedOrder.currentStage].blockHash}
              </div>
            </div>

            {/* Journey Timeline */}
            <div>
              <h3 className="font-bold text-charcoal mb-3">Journey Timeline</h3>
              <div className="space-y-3">
                {selectedOrder.locations.map((location, idx) => {
                  const config = getStageConfig(location.stage);
                  const isCompleted = idx <= selectedOrder.currentStage;
                  const isCurrent = idx === selectedOrder.currentStage;

                  return (
                    <div key={`timeline-${idx}`} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          isCompleted ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-accent/30 animate-pulse' : ''}`}>
                          {config.emoji}
                        </div>
                        {idx < selectedOrder.locations.length - 1 && (
                          <div className={`w-0.5 h-12 ${isCompleted ? 'bg-accent' : 'bg-gray-200'}`}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="font-semibold text-sm text-charcoal">{config.label}</div>
                        <div className="text-xs text-muted">{location.name}</div>
                        <div className="text-xs text-muted">{location.timestamp}</div>
                        {isCompleted && (
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`text-xs ${
                              location.temperature > 30 || location.temperature < 15 
                                ? 'text-red-600 font-bold' 
                                : 'text-green-600'
                            }`}>
                              {location.temperature}°C
                            </span>
                            <span className="text-xs text-muted">•</span>
                            <span className="text-xs text-muted">Quality: {location.qualityScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Risk Analysis */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🤖</span>
                <span className="font-semibold text-purple-900">AI Risk Analysis</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Temperature Risk:</span>
                  <span className={`font-semibold ${
                    getRiskScore(selectedOrder.locations) === 'high' ? 'text-red-600' :
                    getRiskScore(selectedOrder.locations) === 'medium' ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {getRiskScore(selectedOrder.locations).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Delivery Confidence:</span>
                  <span className="font-semibold text-charcoal">
                    {selectedOrder.overallRisk === 'low' ? '95%' : 
                     selectedOrder.overallRisk === 'medium' ? '78%' : '62%'}
                  </span>
                </div>
                {selectedOrder.overallRisk !== 'low' && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <div className="text-xs text-purple-900 font-semibold mb-1">Recommendation:</div>
                    <div className="text-xs text-purple-800">
                      {selectedOrder.overallRisk === 'high' 
                        ? 'Immediate cold storage transfer required. Monitor temperature closely.'
                        : 'Expedite delivery to minimize quality degradation.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainMap;
