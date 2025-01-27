require('dotenv').config();
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Function to get AI response
async function getChatResponse(userInput) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: userInput }
            ],
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, I encountered an error.';
    }
}

// Set up command line interface
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Main chat loop
async function startChat() {
    console.log('AI Chatbot: Hello! How can I help you today? (Type "exit" to end the chat)');

    readline.on('line', async (input) => {
        if (input.toLowerCase() === 'exit') {
            console.log('AI Chatbot: Goodbye!');
            readline.close();
            return;
        }

        const response = await getChatResponse(input);
        console.log('AI Chatbot:', response);
    });
}

startChat();
