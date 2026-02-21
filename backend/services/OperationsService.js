class OperationsService {
  constructor() {
    this.activeShipments = [];
    this.inventory = {};
    this.delays = [];
    this.temperatureStream = [];
    this.alerts = [];
    this.kpis = {
      activeShipmentsCount: 0,
      onTimeDeliveryPercent: 95,
      avgDelayDuration: 0,
      currentSCRI: 48,
      demandVolatility: 12
    };
  }

  addShipment(data) {
    const shipment = {
      id: data.batchID,
      origin: data.location,
      destination: this.getDestination(data.handlerRole),
      currentHandler: data.handlerRole,
      estimatedDelivery: this.calculateETA(data.handlerRole),
      progress: this.calculateProgress(data.handlerRole),
      delayStatus: data.temperature > 30 || data.temperature < 15 ? 'Delayed' : 'On-Time',
      temperature: data.temperature,
      quantity: data.quantity,
      timestamp: Date.now()
    };

    this.activeShipments.push(shipment);
    this.updateInventory(data);
    this.checkDelays(shipment);
    this.updateTemperatureStream(data);
    this.updateKPIs();
    
    return shipment;
  }

  getDestination(handlerRole) {
    const destinations = {
      'Farmer': 'Distribution Center',
      'Distributor': 'Retail Hub',
      'Retailer': 'Consumer Market'
    };
    return destinations[handlerRole] || 'Unknown';
  }

  calculateETA(handlerRole) {
    const hours = {
      'Farmer': 24,
      'Distributor': 12,
      'Retailer': 6
    };
    const eta = new Date();
    eta.setHours(eta.getHours() + (hours[handlerRole] || 24));
    return eta.toISOString();
  }

  calculateProgress(handlerRole) {
    const progress = {
      'Farmer': 33,
      'Distributor': 66,
      'Retailer': 100
    };
    return progress[handlerRole] || 0;
  }

  updateInventory(data) {
    const crop = data.crop || 'Rice'; // Use crop from data or default
    if (!this.inventory[crop]) {
      this.inventory[crop] = {
        total: 0,
        warehouses: {},
        lowStockThreshold: 500,
        overstockThreshold: 5000,
        turnoverRate: 0,
        lastUpdated: Date.now()
      };
    }

    this.inventory[crop].total += data.quantity;
    
    if (!this.inventory[crop].warehouses[data.location]) {
      this.inventory[crop].warehouses[data.location] = 0;
    }
    this.inventory[crop].warehouses[data.location] += data.quantity;

    // Calculate turnover rate (simplified: shipments per day)
    const daysSinceUpdate = (Date.now() - this.inventory[crop].lastUpdated) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 0) {
      this.inventory[crop].turnoverRate = Math.round((data.quantity / this.inventory[crop].total) * 100);
    }
    this.inventory[crop].lastUpdated = Date.now();

    // Check alerts
    if (this.inventory[crop].total < this.inventory[crop].lowStockThreshold) {
      this.addAlert('Low Stock', `${crop} inventory below threshold`, 'warning');
    }
    if (this.inventory[crop].total > this.inventory[crop].overstockThreshold) {
      this.addAlert('Overstock', `${crop} inventory exceeds capacity`, 'info');
    }
  }

  checkDelays(shipment) {
    if (shipment.delayStatus === 'Delayed') {
      const delay = {
        batchID: shipment.id,
        duration: Math.floor(Math.random() * 48) + 1, // hours
        riskLevel: shipment.temperature > 35 ? 'High' : 'Medium',
        mitigation: this.getSuggestedMitigation(shipment.temperature)
      };
      this.delays.push(delay);
      this.addAlert('Delay Detected', `Batch ${shipment.id} delayed`, 'warning');
    }
  }

  getSuggestedMitigation(temperature) {
    if (temperature > 35) {
      return 'Immediate cold storage transfer required. Activate backup refrigeration.';
    } else if (temperature < 10) {
      return 'Temperature too low. Adjust climate control settings.';
    }
    return 'Monitor closely and expedite delivery.';
  }

  updateTemperatureStream(data) {
    const tempData = {
      batchID: data.batchID,
      temperature: data.temperature,
      acceptableRange: { min: 15, max: 30 },
      anomaly: data.temperature < 15 || data.temperature > 30,
      coldChainIntegrity: this.calculateColdChainScore(data.temperature),
      timestamp: Date.now()
    };

    this.temperatureStream.unshift(tempData);
    if (this.temperatureStream.length > 20) {
      this.temperatureStream.pop();
    }

    if (tempData.anomaly) {
      this.addAlert('Temperature Anomaly', `Batch ${data.batchID}: ${data.temperature}°C`, 'danger');
    }
  }

  calculateColdChainScore(temperature) {
    if (temperature >= 15 && temperature <= 30) return 100;
    const deviation = Math.abs(temperature - 22.5);
    return Math.max(0, 100 - (deviation * 5));
  }

  addAlert(type, message, severity) {
    this.alerts.unshift({
      type,
      message,
      severity,
      timestamp: Date.now()
    });
    if (this.alerts.length > 50) {
      this.alerts.pop();
    }
  }

  updateKPIs() {
    this.kpis.activeShipmentsCount = this.activeShipments.length;
    
    const onTimeShipments = this.activeShipments.filter(s => s.delayStatus === 'On-Time').length;
    this.kpis.onTimeDeliveryPercent = this.activeShipments.length > 0 
      ? Math.round((onTimeShipments / this.activeShipments.length) * 100) 
      : 100;

    this.kpis.avgDelayDuration = this.delays.length > 0
      ? Math.round(this.delays.reduce((sum, d) => sum + d.duration, 0) / this.delays.length)
      : 0;

    // Update demand volatility based on recent shipment variations
    if (this.activeShipments.length > 1) {
      const quantities = this.activeShipments.map(s => s.quantity);
      const avg = quantities.reduce((a, b) => a + b, 0) / quantities.length;
      const variance = quantities.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / quantities.length;
      this.kpis.demandVolatility = Math.min(Math.round((Math.sqrt(variance) / avg) * 100), 99);
    }
  }

  getOperationalData() {
    return {
      activeShipments: this.activeShipments,
      inventory: this.inventory,
      delays: this.delays,
      temperatureStream: this.temperatureStream.slice(0, 10),
      alerts: this.alerts.slice(0, 10),
      kpis: this.kpis,
      supplyFlow: this.generateSupplyFlow()
    };
  }

  generateSupplyFlow() {
    const nodes = [
      { id: 'farmer', label: 'Farmers', type: 'source', risk: 'low' },
      { id: 'distributor', label: 'Distributors', type: 'intermediate', risk: 'low' },
      { id: 'retailer', label: 'Retailers', type: 'destination', risk: 'medium' }
    ];

    const edges = [
      { from: 'farmer', to: 'distributor', count: this.activeShipments.filter(s => s.currentHandler === 'Farmer').length },
      { from: 'distributor', to: 'retailer', count: this.activeShipments.filter(s => s.currentHandler === 'Distributor').length }
    ];

    return { nodes, edges };
  }

  updateSCRI(scri) {
    this.kpis.currentSCRI = scri;
    if (scri > 70) {
      this.addAlert('High Risk', `SCRI elevated to ${scri}`, 'danger');
    }
  }

  clearOldData() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.activeShipments = this.activeShipments.filter(s => s.timestamp > oneHourAgo);
  }
}

module.exports = new OperationsService();
