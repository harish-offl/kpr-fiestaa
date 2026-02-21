const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

// Forecast endpoint
router.get('/forecast', (req, res) => {
  const python = spawn('python', ['ai-engine/scripts/predict.py', 'forecast']);
  
  let dataString = '';
  let errorString = '';

  python.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorString += data.toString();
  });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error('Python error:', errorString);
      return res.status(500).json({ error: 'Forecast generation failed', details: errorString });
    }
    
    try {
      const result = JSON.parse(dataString);
      res.json(result);
    } catch (error) {
      console.error('JSON parse error:', error);
      res.status(500).json({ error: 'Invalid response from AI engine' });
    }
  });
});

// Anomaly detection endpoint
router.post('/anomaly', (req, res) => {
  const { temperature, quantity, delay } = req.body;
  
  const python = spawn('python', [
    'ai-engine/scripts/predict.py',
    'anomaly',
    temperature.toString(),
    quantity.toString(),
    delay.toString()
  ]);
  
  let dataString = '';
  let errorString = '';

  python.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorString += data.toString();
  });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error('Python error:', errorString);
      return res.status(500).json({ error: 'Anomaly detection failed', details: errorString });
    }
    
    try {
      const result = JSON.parse(dataString);
      res.json(result);
    } catch (error) {
      console.error('JSON parse error:', error);
      res.status(500).json({ error: 'Invalid response from AI engine' });
    }
  });
});

// Fraud risk endpoint
router.post('/fraud-risk', (req, res) => {
  const { anomalyScore, delayFactor, trustScore } = req.body;
  
  const python = spawn('python', [
    'ai-engine/scripts/predict.py',
    'fraud',
    anomalyScore.toString(),
    delayFactor.toString(),
    trustScore.toString()
  ]);
  
  let dataString = '';
  let errorString = '';

  python.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorString += data.toString();
  });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error('Python error:', errorString);
      return res.status(500).json({ error: 'Fraud risk calculation failed', details: errorString });
    }
    
    try {
      const result = JSON.parse(dataString);
      res.json(result);
    } catch (error) {
      console.error('JSON parse error:', error);
      res.status(500).json({ error: 'Invalid response from AI engine' });
    }
  });
});

// SCRI endpoint
router.post('/scri', (req, res) => {
  const { fraudRisk, delayScore, tempAnomaly, demandVolatility } = req.body;
  
  const python = spawn('python', [
    'ai-engine/scripts/predict.py',
    'scri',
    fraudRisk.toString(),
    delayScore.toString(),
    tempAnomaly.toString(),
    demandVolatility.toString()
  ]);
  
  let dataString = '';
  let errorString = '';

  python.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorString += data.toString();
  });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error('Python error:', errorString);
      return res.status(500).json({ error: 'SCRI calculation failed', details: errorString });
    }
    
    try {
      const result = JSON.parse(dataString);
      res.json(result);
    } catch (error) {
      console.error('JSON parse error:', error);
      res.status(500).json({ error: 'Invalid response from AI engine' });
    }
  });
});

// NEW: Anomaly Check endpoint (Isolation Forest)
router.post('/anomaly-check', (req, res) => {
  const { demand, quantity, delay_days, temperature, stock_level } = req.body;
  
  const inputData = JSON.stringify({
    demand: demand || 0,
    quantity: quantity || 0,
    delay_days: delay_days || 0,
    temperature: temperature || 0,
    stock_level: stock_level || 0
  });
  
  const python = spawn('python', ['ai-engine/scripts/anomaly_detection.py', inputData]);
  
  let dataString = '';
  let errorString = '';

  python.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorString += data.toString();
  });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error('Python error:', errorString);
      return res.status(500).json({ error: 'Anomaly detection failed', details: errorString });
    }
    
    try {
      const result = JSON.parse(dataString);
      res.json(result);
    } catch (error) {
      console.error('JSON parse error:', error);
      res.status(500).json({ error: 'Invalid response from anomaly detection' });
    }
  });
});

// NEW: Risk Forecast endpoint (Logistic Regression)
router.post('/risk-forecast', (req, res) => {
  const { demand, delay_days, temperature, stock_level } = req.body;
  
  const inputData = JSON.stringify({
    demand: demand || 0,
    delay_days: delay_days || 0,
    temperature: temperature || 0,
    stock_level: stock_level || 0
  });
  
  const python = spawn('python', ['ai-engine/scripts/risk_forecasting.py', inputData]);
  
  let dataString = '';
  let errorString = '';

  python.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorString += data.toString();
  });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error('Python error:', errorString);
      return res.status(500).json({ error: 'Risk forecasting failed', details: errorString });
    }
    
    try {
      const result = JSON.parse(dataString);
      res.json(result);
    } catch (error) {
      console.error('JSON parse error:', error);
      res.status(500).json({ error: 'Invalid response from risk forecasting' });
    }
  });
});

// NEW: Generate AI Report endpoint (Comprehensive)
router.post('/generate-report', async (req, res) => {
  try {
    const { demand, quantity, delay_days, temperature, stock_level } = req.body;
    
    // Step 1: Get demand forecast
    const forecastPromise = new Promise((resolve, reject) => {
      const python = spawn('python', ['ai-engine/scripts/predict.py', 'forecast']);
      let dataString = '';
      
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      python.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(dataString));
          } catch (e) {
            resolve({ growth_percentage: 0, confidence: 0 });
          }
        } else {
          resolve({ growth_percentage: 0, confidence: 0 });
        }
      });
    });
    
    // Step 2: Get anomaly detection
    const anomalyData = JSON.stringify({
      demand: demand || 500,
      quantity: quantity || 1000,
      delay_days: delay_days || 0,
      temperature: temperature || 25,
      stock_level: stock_level || 800
    });
    
    const anomalyPromise = new Promise((resolve, reject) => {
      const python = spawn('python', ['ai-engine/scripts/anomaly_detection.py', anomalyData]);
      let dataString = '';
      
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      python.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(dataString));
          } catch (e) {
            resolve({ anomaly: false, score: 0 });
          }
        } else {
          resolve({ anomaly: false, score: 0 });
        }
      });
    });
    
    // Step 3: Get risk forecast
    const riskData = JSON.stringify({
      demand: demand || 500,
      delay_days: delay_days || 0,
      temperature: temperature || 25,
      stock_level: stock_level || 800
    });
    
    const riskPromise = new Promise((resolve, reject) => {
      const python = spawn('python', ['ai-engine/scripts/risk_forecasting.py', riskData]);
      let dataString = '';
      
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      python.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(dataString));
          } catch (e) {
            resolve({ risk_probability: 0.5, risk_level: 'MEDIUM', top_factors: [] });
          }
        } else {
          resolve({ risk_probability: 0.5, risk_level: 'MEDIUM', top_factors: [] });
        }
      });
    });
    
    // Wait for all predictions
    const [forecastResult, anomalyResult, riskResult] = await Promise.all([
      forecastPromise,
      anomalyPromise,
      riskPromise
    ]);
    
    // Step 4: Generate insight report
    const reportData = JSON.stringify({
      demand_forecast: forecastResult,
      anomaly_status: anomalyResult,
      risk_level: riskResult.risk_level,
      risk_probability: riskResult.risk_probability,
      top_factors: riskResult.top_factors || []
    });
    
    const python = spawn('python', ['ai-engine/scripts/insight_generator.py', reportData]);
    let reportString = '';
    let errorString = '';
    
    python.stdout.on('data', (data) => {
      reportString += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorString += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Report generation error:', errorString);
        return res.status(500).json({ error: 'Report generation failed' });
      }
      
      // Calculate combined score
      const combinedScore = (
        (forecastResult.confidence || 0) * 0.3 +
        (anomalyResult.anomaly ? 0 : 100) * 0.3 +
        ((1 - riskResult.risk_probability) * 100) * 0.4
      );
      
      res.json({
        report_text: reportString,
        combined_score: combinedScore.toFixed(1),
        demand_forecast: forecastResult,
        anomaly_status: anomalyResult,
        risk_assessment: riskResult,
        generated_at: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate AI report', details: error.message });
  }
});

// Legacy generate report endpoint (kept for compatibility)
router.post('/generate-report-legacy', (req, res) => {
  const { forecast, scri, fraudRisk, anomalies } = req.body;
  
  const report = {
    generatedAt: new Date().toISOString(),
    executiveSummary: {
      demandForecast: forecast,
      supplyChainRiskIndex: scri,
      fraudProbability: fraudRisk,
      anomaliesDetected: anomalies
    },
    recommendations: generateRecommendations(scri, fraudRisk, anomalies)
  };
  
  res.json(report);
});

function generateRecommendations(scri, fraudRisk, anomalies) {
  const recommendations = [];
  
  if (scri > 70) {
    recommendations.push('High SCRI detected - implement enhanced monitoring protocols');
  }
  
  if (fraudRisk > 60) {
    recommendations.push('Elevated fraud risk - conduct supplier audit');
  }
  
  if (anomalies > 5) {
    recommendations.push('Multiple anomalies detected - review cold chain procedures');
  }
  
  return recommendations;
}

module.exports = router;
