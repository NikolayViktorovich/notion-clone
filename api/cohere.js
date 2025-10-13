const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, context } = req.body;
    
    console.log('Processing Cohere request...');
    
    const fullPrompt = context 
      ? `Контекст: ${context}\n\nЗапрос: ${prompt}\n\nОтвет:`
      : `Ты полезный AI ассистент для редактора документов на русском языке. Ответь на запрос: ${prompt}`;

    const cohereResponse = await fetch('https://api.cohere.ai/v1/generate', {
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

    if (!cohereResponse.ok) {
      const errorText = await cohereResponse.text();
      console.error('Cohere API error:', cohereResponse.status, errorText);
      return res.status(cohereResponse.status).json({ 
        error: `Cohere API error: ${cohereResponse.status}` 
      });
    }

    const data = await cohereResponse.json();
    console.log('Cohere API success!');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
};