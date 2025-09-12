const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export default async function handler(req, res) {
  try {
    const { id, days = 7 } = req.query;
    if (!id) return res.status(400).json({ error: "id required" });

    const url = `${COINGECKO_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=hourly`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: response.statusText });
    }
    const raw = await response.json();

    // فرمت ساده برای فرانت
    const labels = raw.prices.map((p) => new Date(p[0]).toISOString());
    const prices = raw.prices.map((p) => p[1]);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json({ labels, prices });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
}
