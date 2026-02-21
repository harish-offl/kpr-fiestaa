import React, { useState } from 'react';
import axios from 'axios';

const AddTransaction = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    batchID: '',
    farmerID: '',
    location: '',
    temperature: '',
    quantity: '',
    handlerRole: 'Farmer',
    crop: 'Rice'
  });

  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    try {
      await axios.post('http://localhost:5000/api/blockchain/add', {
        ...formData,
        temperature: parseFloat(formData.temperature),
        quantity: parseFloat(formData.quantity)
      });

      const qrRes = await axios.get(`http://localhost:5000/api/qrcode/${formData.batchID}`);
      setQrCode(qrRes.data.qrCode);

      setSuccess(true);
      onAdd();
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({ 
          batchID: '', 
          farmerID: '', 
          location: '', 
          temperature: '', 
          quantity: '', 
          handlerRole: 'Farmer',
          crop: 'Rice'
        });
        setQrCode(null);
        setSuccess(false);
      }, 3000);
    } catch (error) {
      alert('Error adding transaction: ' + (error.response?.data?.error || error.message));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateBatchID = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setFormData({ ...formData, batchID: `BATCH-${timestamp}-${random}` });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-charcoal">Add New Transaction</h1>
        <p className="text-muted mt-2">Record a new supply chain event to the blockchain</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Batch ID */}
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Batch ID <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  required 
                  value={formData.batchID} 
                  onChange={(e) => setFormData({ ...formData, batchID: e.target.value })} 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono"
                  placeholder="BATCH-XXXXX"
                />
                <button
                  type="button"
                  onClick={generateBatchID}
                  className="px-4 py-3 bg-gray-100 text-charcoal rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  🎲 Generate
                </button>
              </div>
              <p className="text-xs text-muted mt-1">Unique identifier for this batch</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Farmer ID */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Farmer ID <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.farmerID} 
                  onChange={(e) => setFormData({ ...formData, farmerID: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="FARMER-001"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.location} 
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Punjab, India"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temperature */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Temperature (°C) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  required 
                  value={formData.temperature} 
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="22.5"
                />
                <p className="text-xs text-muted mt-1">Acceptable range: 15°C - 30°C</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Quantity (kg) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  required 
                  value={formData.quantity} 
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="1000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Handler Role */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Handler Role <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.handlerRole} 
                  onChange={(e) => setFormData({ ...formData, handlerRole: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Retailer">Retailer</option>
                </select>
              </div>

              {/* Crop Type */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Crop Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.crop} 
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Corn">Corn</option>
                  <option value="Vegetables">Vegetables</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : success
                  ? 'bg-success'
                  : 'bg-accent hover:bg-accent/90 shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Adding to Blockchain...
                </span>
              ) : success ? (
                <span className="flex items-center justify-center gap-2">
                  <span>✓</span> Transaction Added Successfully!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>⛓️</span> Add to Blockchain
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Guidelines */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-heading font-semibold text-charcoal mb-4">Transaction Guidelines</h3>
            <div className="space-y-3 text-sm text-muted">
              <div className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Ensure all information is accurate before submission</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Batch ID must be unique across the chain</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Temperature should be within 15°C - 30°C range</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Transactions are immutable once added</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {qrCode && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="font-heading font-semibold text-charcoal mb-4">Batch Verification QR Code</h3>
              <div className="bg-gray-50 p-4 rounded-lg inline-block">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-xs text-muted mt-4">
                Scan to verify batch authenticity
              </p>
              <button className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-semibold">
                📥 Download QR Code
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg border-2 border-accent/30 p-6">
            <h3 className="font-heading font-semibold text-charcoal mb-4">Blockchain Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Network Status</span>
                <span className="flex items-center gap-1 text-success text-sm font-semibold">
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Avg Block Time</span>
                <span className="text-sm font-semibold text-charcoal">~2 seconds</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Gas Fee</span>
                <span className="text-sm font-semibold text-charcoal">Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
