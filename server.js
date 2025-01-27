const express = require('express');
const app = express();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serve static files
app.use(express.static('.'));
app.use(express.json());

// Store conversation history (in memory)
let conversationHistory = [];

// Chat endpoint
app.post('/chat', async (req, res) => {
    try {
        console.log('Received message:', req.body.message);
        
        const response = await fetch(
            "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
            {
                headers: { 
                    Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({ 
                    inputs: req.body.message,
                    parameters: {
                        max_length: 50,
                        temperature: 0.7,
                        top_p: 0.9,
                        do_sample: true
                    }
                }),
            }
        );
        
        const result = await response.json();
        console.log('API Response:', result);
        
        // Extract response from DialoGPT format
        let botResponse = result[0]?.generated_text || "Hello! How can I help you?";
        
        // Clean up the response
        botResponse = botResponse.replace(req.body.message, '').trim();
        
        // If empty after cleaning, provide a default response
        if (!botResponse) {
            botResponse = "Hello! How can I help you?";
        }
        
        res.json({ response: botResponse });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ response: "Hello! How can I help you?" });
    }
});

// Use environment port or default to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Using Hugging Face token:', process.env.HUGGING_FACE_TOKEN ? 'Token found' : 'No token found');
}); 
