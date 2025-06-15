const fetch = require('node-fetch');

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = { contents: [{ parts: [{ text: prompt }] }] };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('API Error:', await response.text());
            return { statusCode: 500, body: JSON.stringify({ error: "API Error" }) };
        }

        const result = await response.json();
        const aiText = result.candidates[0]?.content?.parts[0]?.text;

        if (!aiText) {
             return { statusCode: 500, body: JSON.stringify({ error: 'No text found in response' }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiText }),
        };

    } catch (error) {
        console.error('Function Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
