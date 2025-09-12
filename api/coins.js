const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export default async function handler(req, res) {
  try {
    const { page = 1, perPage = 40 } = req.query;
    const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: response.statusText });
    }
    const data = await response.json();

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
}
