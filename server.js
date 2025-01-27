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
            "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
            {
                headers: { 
                    Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({ 
                    inputs: req.body.message,
                    parameters: {
                        max_length: 100,
                        temperature: 0.7,
                        top_p: 0.9,
                        do_sample: true
                    }
                }),
            }
        );
        
        const result = await response.json();
        console.log('API Response:', result);
        
        // Extract response from Blenderbot format
        let botResponse = result.generated_text || "I'm here to help! What would you like to talk about?";
        
        res.json({ response: botResponse });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ response: "I'm here to help! What would you like to talk about?" });
    }
});

// Use environment port or default to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Using Hugging Face token:', process.env.HUGGING_FACE_TOKEN ? 'Token found' : 'No token found');
}); 
