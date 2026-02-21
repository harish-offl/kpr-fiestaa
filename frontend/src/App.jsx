import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import BlockchainExplorer from './components/BlockchainExplorer';
import AddTransaction from './components/AddTransaction';
import OperationsDashboard from './components/OperationsDashboard';
import AIInsights from './components/AIInsights';
import ComplianceDashboard from './components/ComplianceDashboard';
import SupplyChainMap from './components/SupplyChainMap';
import ChatbotWidget from './components/ChatbotWidget';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadForecast();
    loadBlockchain();
    loadAlerts();
  }, []);

  const loadForecast = async () => {
    try {
      const res = await axios.get(`${API_URL}/ai/forecast`);
      setForecast(res.data);
    } catch (error) {
      console.error('Forecast error:', error);
    }
  };

  const loadBlockchain = async () => {
    try {
      const res = await axios.get(`${API_URL}/blockchain/explorer`);
      setBlocks(res.data);
    } catch (error) {
      console.error('Blockchain error:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/operations/alerts`);
      setAlerts(res.data);
    } catch (error) {
      console.error('Alerts error:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', desc: 'Overview & Metrics' },
    { id: 'operations', icon: '🚚', label: 'Operations', desc: 'Real-Time Control' },
    { id: 'compliance', icon: '🛡️', label: 'Compliance', desc: 'Regulatory & Escalation' },
    { id: 'traceability', icon: '⛓️', label: 'Traceability', desc: 'Blockchain Ledger' },
    { id: 'ai-insights', icon: '🤖', label: 'AI Insights', desc: 'Predictive Analytics' },
    { id: 'map', icon: '🗺️', label: 'Supply Chain Map', desc: 'Live Flow Visualization' },
    { id: 'add-transaction', icon: '➕', label: 'New Transaction', desc: 'Add to Chain' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-primary to-secondary text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          {!sidebarCollapsed ? (
            <div>
              <h1 className="sketch-logo text-2xl text-white mb-1">
                AGR<span className="text-accent">·</span>CHAIN
              </h1>
              <p className="text-xs text-gray-400">Intelligent Supply Chain</p>
            </div>
          ) : (
            <div className="text-2xl text-center">🌾</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={activeView === item.id ? 'sidebar-item-active' : 'sidebar-item'}
            >
              <span className="text-2xl">{item.icon}</span>
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-4 border-t border-white/10 hover:bg-white/5 transition-colors"
        >
          <span className="text-xl">{sidebarCollapsed ? '→' : '←'}</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search batches, transactions..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 w-80"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Alerts */}
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <span className="text-xl">🔔</span>
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <div className="text-sm font-semibold text-charcoal">Admin User</div>
                <div className="text-xs text-muted">Platform Administrator</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {activeView === 'dashboard' && <Dashboard forecast={forecast} blocks={blocks} />}
          {activeView === 'operations' && <OperationsDashboard />}
          {activeView === 'compliance' && <ComplianceDashboard />}
          {activeView === 'traceability' && <BlockchainExplorer blocks={blocks} />}
          {activeView === 'ai-insights' && <AIInsights forecast={forecast} />}
          {activeView === 'map' && <SupplyChainMap />}
          {activeView === 'add-transaction' && <AddTransaction onAdd={loadBlockchain} />}
        </main>
      </div>

      {/* Chatbot Widget - Floating on all pages */}
      <ChatbotWidget />
    </div>
  );
}

export default App;
