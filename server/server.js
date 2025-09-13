import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 4000;

app.get("/express/coins", async (req, res) => {
  try {
    const { page = 1, perPage = 40 } = req.query;
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/express/chart", async (req, res) => {
  try {
    const { id, days = 7 } = req.query;
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Express API running on http://localhost:${PORT}`));
