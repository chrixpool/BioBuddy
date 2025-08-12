	// api/gpt.js (Vercel serverless)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are a helpful assistant that writes short social bios and captions.' },
                   { role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data });

    const text = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? '';
    res.status(200).json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
