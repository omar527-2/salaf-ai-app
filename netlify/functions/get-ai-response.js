exports.handler = async function(event) {
    // Check if the request method is POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Parse the incoming request body to get the prompt
        const { prompt } = JSON.parse(event.body);
        
        // Get the secret API key from the environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        
        // If the API key is missing, return an error
        if (!apiKey) {
            console.error("API Key is missing!");
            return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error." }) };
        }
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        // Use the global fetch provided by Netlify's environment
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        // Check for a valid response from the Gemini API
        if (!response.ok || !result.candidates || result.candidates.length === 0) {
            console.error('Gemini API Error:', result);
            return { statusCode: 500, body: JSON.stringify({ error: "Failed to get a response from the AI." }) };
        }

        const aiText = result.candidates[0]?.content?.parts[0]?.text;

        // Return the AI's response successfully
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiText }),
        };

    } catch (error) {
        // Catch any other errors during execution
        console.error('Function execution error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
