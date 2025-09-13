const API_KEY = process.env.COINGECKO_API_KEY;

app.get("/express/coins", async (req, res) => {
  const url = `https://api.coingecko.com/api/v3/coins/markets?...`;
  const r = await fetch(url, {
    headers: {
      "x-cg-demo-api-key": API_KEY,
    },
  });
  const data = await r.json();
  res.json(data);
});
