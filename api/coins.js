// pages/api/coins.js

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export default async function handler(req, res) {
  try {
    const { page = 1, perPage = 40 } = req.query;

    const API_KEY = process.env.COINGECKO_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "API key is missing in server environment" });
    }

    const url = new URL(`${COINGECKO_BASE}/coins/markets`);
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("order", "market_cap_desc");
    url.searchParams.set("per_page", perPage);
    url.searchParams.set("page", page);
    url.searchParams.set("sparkline", "true");
    url.searchParams.set("price_change_percentage", "24h");

    const response = await fetch(url.toString(), {
      headers: {
        "x-cg-demo-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `CoinGecko API error ${response.status}` });
    }

    const data = await response.json();

    // کش کوتاه‌مدت برای کاهش لود
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

    res.status(200).json(data);
  } catch (err) {
    console.error("Coins API failed:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}
