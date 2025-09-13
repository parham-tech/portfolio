// pages/api/chart.js

export default async function handler(req, res) {
  const { id, days = 7 } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing coin id" });
  }

  const API_KEY = process.env.COINGECKO_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "API key is missing in server environment" });
  }

  try {
    const url = new URL(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`);
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("days", days);

    const response = await fetch(url.toString(), {
      headers: {
        "x-cg-demo-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `CoinGecko API error ${response.status}` });
    }

    const data = await response.json();

    // می‌تونیم برای بهبود performance کش هم ست کنیم
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");

    return res.status(200).json(data);
  } catch (err) {
    console.error("Chart API failed:", err);
    return res.status(500).json({ error: "Failed to fetch chart data" });
  }
}
