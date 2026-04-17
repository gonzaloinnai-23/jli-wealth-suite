// Vercel serverless proxy to Anthropic. The API key lives in the
// ANTHROPIC_API_KEY env var and never reaches the browser.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY no está configurada en Vercel.' });
  }

  const { messages, system, model } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages (array) requerido' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: system || 'Responde en español de forma concisa.',
        messages
      })
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.error?.message || 'Error llamando a Anthropic', detail: data });
    }
    const text = Array.isArray(data.content)
      ? data.content.filter(c => c.type === 'text').map(c => c.text).join('\n')
      : '';
    return res.status(200).json({ text, usage: data.usage });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
