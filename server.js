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
        console.log('1. Received message:', req.body.message);
        
        // Add user message to history
        conversationHistory.push(req.body.message);
        
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
                    options: { wait_for_model: true }
                }),
            }
        );
        
        console.log('2. Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('3. API Response:', result);
        
        // Extract the response text
        const botResponse = result[0].generated_text;
        
        if (!botResponse) {
            throw new Error('No response from API');
        }
        
        // Add bot response to history
        conversationHistory.push(botResponse);
        
        // Keep only last 10 messages
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
        }
        
        console.log('4. Sending response:', botResponse);
        res.json({ response: botResponse });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Use environment port or default to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Using Hugging Face token:', process.env.HUGGING_FACE_TOKEN ? 'Token found' : 'No token found');
}); 
