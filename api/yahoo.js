// Vercel serverless proxy para Yahoo Finance (esquiva CORS desde el browser).
// Uso (same-origin): /api/yahoo?symbol=^VIX&range=10y&interval=1wk
const SYMBOL_RE = /^[A-Za-z0-9.^=:-]{1,15}$/;
const ALLOWED_RANGE = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']);
const ALLOWED_INTERVAL = new Set(['1d', '5d', '1wk', '1mo', '3mo']);

export default async function handler(req, res) {
  const symbol = (req.query.symbol || '').toString();
  const range = (req.query.range || '10y').toString();
  const interval = (req.query.interval || '1wk').toString();

  if (!SYMBOL_RE.test(symbol)) {
    res.status(400).json({ error: 'invalid symbol' });
    return;
  }
  if (!ALLOWED_RANGE.has(range)) {
    res.status(400).json({ error: 'invalid range' });
    return;
  }
  if (!ALLOWED_INTERVAL.has(interval)) {
    res.status(400).json({ error: 'invalid interval' });
    return;
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JLI-WealthSuite/1.0)',
        'Accept': 'application/json',
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'upstream ' + upstream.status });
      return;
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    res.status(200).json(data);
  } catch (err) {
    console.error('yahoo proxy fetch failed:', err);
    res.status(502).json({ error: 'fetch failed' });
  }
}
