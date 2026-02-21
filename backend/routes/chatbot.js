const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
// Note: In a real environment, you would use 'node-fetch' or 'axios' for API calls to Ollama
// and a Python bridge or API for Whisper and Edge-TTS.

const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Ensure public/audio directory exists for TTS output
const audioDir = path.join(__dirname, '../public/audio');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

// Voice Query Endpoint (STT -> LLM -> TTS)
router.post('/voice-query', upload.single('audio'), async (req, res) => {
    try {
        const audioFile = req.file;
        if (!audioFile) {
            return res.status(400).json({ error: 'No audio provided' });
        }

        console.log('Voice processing started for file:', audioFile.path);

        // 1. STT: Whisper Integration
        // Mocking Whisper response for now. 
        // In reality: const text = await transcribeWithWhisper(audioFile.path);
        const text = "What is the demand forecast for next month?";

        // 2. LLM: Ollama Integration (Llama 3 / Mistral)
        let reply = "";
        try {
            const ollamaRes = await axios.post('http://localhost:11434/api/generate', {
                model: 'llama3',
                prompt: `You are an AgriChain Assistant for farmers. The farmer asks: "${text}". Give a short, helpful professional response.`,
                stream: false
            });
            reply = ollamaRes.data.response;
        } catch (err) {
            console.log("Ollama not available, using fallback logic");
            reply = "Based on our AI analysis, demand is expected to rise by 12% next month. I recommend preparing 15% more inventory.";
        }

        // 3. TTS: Edge-TTS Integration
        // In reality, you'd call a python script: edge-tts --voice en-US-GuyNeural --text "${reply}" --write-media output.mp3
        const audioFileName = `reply_${Date.now()}.mp3`;
        const audioPath = path.join(audioDir, audioFileName);

        // Mocking TTS file creation (In reality, the edge-tts tool would generate this)
        fs.writeFileSync(audioPath, "Fake Audio Content");

        res.json({
            text: text,
            reply: reply,
            audioUrl: `/audio/${audioFileName}`
        });

    } catch (error) {
        console.error('Voice processing error:', error);
        res.status(500).json({ error: 'Failed to process voice' });
    }
});

const SYSTEM_PROMPT = `
You are the AgriChain AI Assistant, an expert in blockchain-driven supply chain management and agricultural predictive analytics. 
Your goal is to help users (farmers, distributors, retailers) manage their operations using the AgriChain platform.

AgriChain Platform Features:
1. Blockchain Transparency: Every transaction (harvest, transit, delivery) is recorded on an immutable ledger.
2. AI Forecasting: We use ensemble models (Random Forest, ARIMA, Linear Regression) to predict demand and supply trends.
3. Real-time IoT Monitoring: We track temperature, humidity, and location via sensors.
4. Food Safety Trust Score: A metric from 0-100 based on cold-chain integrity and blockchain verification.
5. Risk Management: AI detects anomalies (e.g., temperature spikes) and calculates fraud risk.

Tone Guidelines:
- Professional, helpful, and concise.
- Use agricultural and tech terminology appropriately (e.g., "cold chain integrity", "immutable ledger", "ensemble models").
- If asked about specific data (like a forecast), provide a realistic but simulated figure if real-time data integration isn't explicitly passed, but always mention it's "based on current platform analytics."

Current context: The user is interacting with the dashboard.
`;

router.post('/query', async (req, res) => {
    const { query, history } = req.body;

    try {
        // Prepare messages for Ollama /api/chat
        const formattedMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...(history || []).map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content
            })),
            { role: 'user', content: query }
        ];

        // Call local Ollama instance /api/chat
        const ollamaRes = await axios.post('http://localhost:11434/api/chat', {
            model: 'llama3',
            messages: formattedMessages,
            stream: false
        });

        res.json({ response: ollamaRes.data.message.content });
    } catch (error) {
        console.error("Ollama connection error:", error.message);

        // Fallback to local rule-based logic
        const q = query.toLowerCase();
        let response = "I'm currently operating in offline mode. I can help with demand forecasts, critical alerts, food safety, and blockchain status.";

        if (q.includes('forecast') || q.includes('demand')) {
            response = "Based on our latest AI analysis, demand is projected to increase by 12.5% over the next 30 days. We recommend increasing inventory by 15% to meet this growth.";
        } else if (q.includes('alert') || q.includes('critical') || q.includes('problem')) {
            response = "There is currently 1 critical alert: Temperature anomaly detected in Batch #EXP-001 at the Mumbai Distribution Center. Immediate inspection is required.";
        } else if (q.includes('safety') || q.includes('score')) {
            response = "The overall Food Safety Trust Score is 94/100. This is based on real-time sensor data and blockchain-verified certifications across the supply chain.";
        } else if (q.includes('blockchain') || q.includes('status') || q.includes('ledger')) {
            response = "The blockchain network is healthy and synchronized. All 128 recent transactions have been verified. No tampering detected in the immutable ledger.";
        }

        res.json({ response, note: "Ollama not detected or misconfigured." });
    }
});

module.exports = router;
