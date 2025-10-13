const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/cohere/generate', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    
    const fullPrompt = context 
      ? `Контекст: ${context}\n\nЗапрос: ${prompt}\n\nОтвет:`
      : `Ты полезный AI ассистент для редактора документов на русском языке. Ответь на запрос: ${prompt}`;

    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pPKhVV1M7bTSwcbHf4wjRTZa0r0l3CAMbyOREc2S',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: fullPrompt,
        max_tokens: 500,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});