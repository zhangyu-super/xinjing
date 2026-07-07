// Vercel Serverless Function - Proxy chat requests to MiniMax API
const MINIMAX_API_KEY = 'sk-api--Qbo1Yv-6JAHFHWz8HOsLSmC9_VFLP5X8xcEJfI9zngEy8JPc6o3YhPGO0oLRSUA_fBHnQC7QwCfRxPFfSioEObk1asHffwwHhQKq3Idslszp4KY593VCgo';
const MINIMAX_BASE = 'https://api.minimaxi.com';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const model = body.model || 'MiniMax-M3';

    const minimaxBody = {
      model: model,
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 4096,
      stream: false,
      extra_body: { reasoning_split: true }
    };

    const response = await fetch(MINIMAX_BASE + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + MINIMAX_API_KEY
      },
      body: JSON.stringify(minimaxBody)
    });

    const data = await response.json();

    // Clean up think tags from MiniMax response
    if (data.choices?.[0]?.message?.content) {
      data.choices[0].message.content = data.choices[0].message.content
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .trim();
    }

    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
