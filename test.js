require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testHuggingFace() {
    try {
        console.log("Testing Hugging Face connection...");
        console.log("Using token:", process.env.HUGGING_FACE_TOKEN); // Check if token is loaded
        
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
            {
                headers: { 
                    Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}` 
                },
                method: "POST",
                body: JSON.stringify({ inputs: "Hello, how are you?" }),
            }
        );
        
        // Log the response status
        console.log("Response status:", response.status);
        
        const result = await response.json();
        console.log("Response:", result);
        
        // If there's an error message in the response
        if (result.error) {
            console.log("Error from API:", result.error);
        }
    } catch (error) {
        console.error("Detailed Error:", error);
    }
}

// Run the test
testHuggingFace(); 