// Vercel serverless proxy para Yahoo Finance (esquiva CORS desde el browser)
// Uso: /api/yahoo?symbol=^VIX&range=10y&interval=1wk
export default async function handler(req, res) {
  const symbol = (req.query.symbol || '').toString();
  const range = (req.query.range || '10y').toString();
  const interval = (req.query.interval || '1wk').toString();

  if (!symbol) {
    res.status(400).json({ error: 'missing symbol' });
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: 'fetch failed', detail: String(err) });
  }
}
