import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const AIInsights = ({ forecast }) => {
  const [selectedModel, setSelectedModel] = useState('random_forest');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F1F1F',
        padding: 12,
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

  const modelAccuracyData = forecast ? {
    labels: ['Linear Regression', 'Random Forest', 'ARIMA'],
    datasets: [{
      label: 'Model Accuracy (%)',
      data: [
        forecast.metrics.linear_regression.accuracy,
        forecast.metrics.random_forest.accuracy,
        forecast.metrics.arima.accuracy
      ],
      backgroundColor: ['#3EC1D3', '#2A9D8F', '#F4A261'],
      borderRadius: 8,
    }]
  } : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-charcoal">AI Insights & Predictive Analytics</h1>
          <p className="text-muted mt-2">Generative AI-powered supply chain intelligence</p>
        </div>
        <button className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-semibold shadow-lg">
          🤖 Generate New Report
        </button>
      </div>

      {/* Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">AI Model Performance Comparison</h2>
          <div className="h-80">
            {modelAccuracyData && <Bar data={modelAccuracyData} options={{...chartOptions, scales: {...chartOptions.scales, y: { ...chartOptions.scales.y, beginAtZero: true, max: 100 }}}} />}
          </div>
          {forecast && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xs text-muted mb-1">Best Model</div>
                <div className="text-lg font-bold text-success">Random Forest</div>
                <div className="text-xs text-muted mt-1">{forecast.metrics.random_forest.accuracy.toFixed(1)}% accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted mb-1">Avg MAE</div>
                <div className="text-lg font-bold text-charcoal">
                  {((forecast.metrics.linear_regression.mae + forecast.metrics.random_forest.mae + forecast.metrics.arima.mae) / 3).toFixed(2)}
                </div>
                <div className="text-xs text-muted mt-1">Mean Absolute Error</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted mb-1">Ensemble Score</div>
                <div className="text-lg font-bold text-accent">
                  {((forecast.metrics.linear_regression.accuracy + forecast.metrics.random_forest.accuracy + forecast.metrics.arima.accuracy) / 3).toFixed(1)}%
                </div>
                <div className="text-xs text-muted mt-1">Combined accuracy</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="ai-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="font-heading font-semibold text-charcoal">Prediction Confidence</h3>
                <p className="text-xs text-muted">Model reliability</p>
              </div>
            </div>
            {forecast && (
              <>
                <div className="text-5xl font-bold text-accent mb-2">{forecast.confidence.toFixed(0)}%</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-accent to-success transition-all"
                    style={{ width: `${forecast.confidence}%` }}
                  ></div>
                </div>
                <div className="mt-4 text-xs text-muted">
                  High confidence prediction based on historical patterns
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-heading font-semibold text-charcoal mb-4">Model Selection</h3>
            <div className="space-y-2">
              {['linear_regression', 'random_forest', 'arima'].map(model => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedModel === model 
                      ? 'bg-accent text-white' 
                      : 'bg-gray-50 text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <div className="font-semibold text-sm">
                    {model.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </div>
                  {forecast && (
                    <div className="text-xs mt-1 opacity-80">
                      {forecast.metrics[model].accuracy.toFixed(1)}% accuracy
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💡</span>
            <div>
              <h2 className="text-xl font-heading font-semibold text-charcoal">AI-Generated Recommendations</h2>
              <p className="text-sm text-muted">Actionable insights for optimization</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { 
                priority: 'high', 
                title: 'Inventory Optimization', 
                desc: 'Increase rice inventory by 15% to meet projected demand surge in next 14 days',
                impact: '+12% efficiency'
              },
              { 
                priority: 'medium', 
                title: 'Route Optimization', 
                desc: 'Alternative transport routes recommended for 3 high-risk shipments',
                impact: '-8 hours delay'
              },
              { 
                priority: 'low', 
                title: 'Supplier Diversification', 
                desc: 'Consider onboarding 2 additional suppliers in Region B for risk mitigation',
                impact: '+5% resilience'
              },
            ].map((rec, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-500' :
                      rec.priority === 'medium' ? 'bg-warning' :
                      'bg-success'
                    }`}></span>
                    <h3 className="font-semibold text-charcoal">{rec.title}</h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold">
                    {rec.impact}
                  </span>
                </div>
                <p className="text-sm text-muted leading-relaxed">{rec.desc}</p>
                <button className="mt-3 text-sm text-accent hover:underline font-semibold">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔮</span>
            <div>
              <h2 className="text-xl font-heading font-semibold text-charcoal">Predictive Risk Factors</h2>
              <p className="text-sm text-muted">AI-identified potential issues</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { factor: 'Weather Impact', risk: 35, trend: 'increasing', desc: 'Monsoon season approaching - potential transport delays' },
              { factor: 'Market Volatility', risk: 22, trend: 'stable', desc: 'Price fluctuations within normal range' },
              { factor: 'Supply Disruption', risk: 18, trend: 'decreasing', desc: 'Supplier reliability improving' },
              { factor: 'Demand Spike', risk: 45, trend: 'increasing', desc: 'Festival season driving increased demand' },
            ].map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-charcoal">{item.factor}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${
                      item.trend === 'increasing' ? 'text-red-500' :
                      item.trend === 'decreasing' ? 'text-success' :
                      'text-muted'
                    }`}>
                      {item.trend === 'increasing' ? '↑' : item.trend === 'decreasing' ? '↓' : '→'}
                    </span>
                    <span className="text-lg font-bold text-charcoal">{item.risk}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.risk > 40 ? 'bg-red-500' :
                      item.risk > 25 ? 'bg-warning' :
                      'bg-success'
                    }`}
                    style={{ width: `${item.risk}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explain This Insight */}
      <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg border-2 border-accent/30 p-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🤖</span>
          <div className="flex-1">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-2">How AI Generates These Insights</h2>
            <p className="text-muted leading-relaxed mb-4">
              Our AI engine uses ensemble machine learning models (Linear Regression, Random Forest, and ARIMA) to analyze historical supply chain data, weather patterns, market trends, and real-time blockchain transactions. The system processes over 50+ data points per transaction to generate predictive insights with {forecast?.confidence.toFixed(0)}% confidence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-accent font-bold mb-1">Data Sources</div>
                <div className="text-sm text-muted">Blockchain ledger, IoT sensors, market APIs, weather data</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-accent font-bold mb-1">Processing</div>
                <div className="text-sm text-muted">Real-time analysis, pattern recognition, anomaly detection</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-accent font-bold mb-1">Output</div>
                <div className="text-sm text-muted">Actionable recommendations, risk scores, forecasts</div>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-semibold">
              📚 Learn More About Our AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
