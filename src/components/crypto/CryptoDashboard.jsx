import React, { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const DEFAULT_PER_PAGE = 40;
const DEFAULT_CACHE_TTL = 60_000;
const DEFAULT_CHART_CACHE_TTL = 300_000;
const WATCHLIST_KEY = "cg_watchlist_v3";

const now = () => Date.now();

const downloadCsv = (filename, rows) => {
  const csv = [
    Object.keys(rows[0] || {}).join(","),
    ...rows.map((r) =>
      Object.values(r)
        .map((v) => (v == null ? "" : `"${String(v).replace(/"/g, '""')}"`))
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function CryptoDashboard({
  perPage = DEFAULT_PER_PAGE,
  cacheTtlMs = DEFAULT_CACHE_TTL,
  chartCacheTtlMs = DEFAULT_CHART_CACHE_TTL,
  theme,
  themeClasses = {},
}) {
  const [coins, setCoins] = useState([]);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [coinsError, setCoinsError] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState({ key: "market_cap", dir: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [days, setDays] = useState(7);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const coinsAbortRef = useRef(null);
  const chartAbortRef = useRef(null);
  const lastCoinsFetchRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const loadCoins = async () => {
      setLoadingCoins(true);
      setCoinsError(null);
      const nowTs = now();
      if (nowTs - lastCoinsFetchRef.current < 4000) await new Promise((r) => setTimeout(r, 700));
      lastCoinsFetchRef.current = now();
      if (coinsAbortRef.current) coinsAbortRef.current.abort();
      coinsAbortRef.current = new AbortController();
      const signal = coinsAbortRef.current.signal;

      const url = `/api/coins?page=${page}&perPage=${perPage}`;

      try {
        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        if (cancelled) return;
        setCoins(data);
        if (!selected && data.length > 0) setSelected(data[0]);
      } catch (err) {
        if (err.name === "AbortError") return;
        setCoinsError(err.message || "Failed to fetch coins");
      } finally {
        if (!cancelled) setLoadingCoins(false);
      }
    };

    loadCoins();
    return () => {
      cancelled = true;
      if (coinsAbortRef.current) coinsAbortRef.current.abort();
    };
  }, [perPage, page]);

  useEffect(() => {
    if (!selected) {
      setChartData(null);
      return;
    }

    if (chartAbortRef.current) chartAbortRef.current.abort();
    const controller = new AbortController();
    chartAbortRef.current = controller;
    const signal = controller.signal;

    const cacheKey = `chart::${selected.id}::${days}`;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expires > now()) {
          setChartData(parsed.data);
          setChartLoading(false);
          return;
        } else {
          sessionStorage.removeItem(cacheKey);
        }
      }
    } catch {}

    const loadChart = async () => {
      setChartLoading(true);
      setChartError(null);
      try {
        const url = `/api/chart?id=${selected.id}&days=${days}`;
        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const raw = await res.json();
        const labels = raw.prices.map((p) => new Date(p[0]).toLocaleString());
        const prices = raw.prices.map((p) => p[1]);
        const payload = { labels, prices };
        setChartData(payload);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ expires: now() + chartCacheTtlMs, data: payload }));
        } catch {}
      } catch (err) {
        if (err.name === "AbortError") return;
        setChartError(err.message || "Failed to fetch chart data");
      } finally {
        setChartLoading(false);
      }
    };

    loadChart();
    return () => controller.abort();
  }, [selected, days, chartCacheTtlMs]);

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch {}
  }, [watchlist]);

  const filtered = useMemo(() => {
    const q = debouncedQuery;
    if (!q) return coins;
    return coins.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [coins, debouncedQuery]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let va = a[key], vb = b[key];
      if (va == null) va = 0;
      if (vb == null) vb = 0;
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortBy]);

  const PER_PAGE_UI = 12;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE_UI));
  const paged = useMemo(() => {
    const start = (page - 1) * PER_PAGE_UI;
    return sorted.slice(start, start + PER_PAGE_UI);
  }, [sorted, page]);

  const chartJsData = useMemo(() => {
    if (!chartData) return null;
    return {
      labels: chartData.labels,
      datasets: [
        {
          label: selected?.name || "Price",
          data: chartData.prices,
          fill: true,
          backgroundColor: "rgba(59,130,246,0.08)",
          borderColor: "#3b82f6",
          pointRadius: 0,
          tension: 0.25,
        },
      ],
    };
  }, [chartData, selected]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
    scales: { x: { display: false }, y: { ticks: { callback: (v) => `$${Number(v).toFixed(2)}` } } },
  }), []);

  const toggleWatch = (id) => {
    setWatchlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleExportCsv = () => {
    const rows = (sorted.length ? sorted : coins).map((c) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      price: c.current_price,
      change_24h: c.price_change_percentage_24h,
      market_cap: c.market_cap,
      total_volume: c.total_volume,
    }));
    if (rows.length === 0) return;
    downloadCsv(`crypto_export_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className={`w-full text-gray-200 ${themeClasses?.[theme] || ""}`}>
      {/* LEFT: list + controls */}
      <div className="flex-1 bg-gray-800/40 rounded p-4">
        {/* search & sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              placeholder="Search name or symbol..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded bg-gray-900 placeholder-gray-400 text-sm w-full md:w-72"
            />
            <button onClick={() => { setQuery(""); setDebouncedQuery(""); }} className="px-3 py-2 rounded bg-gray-700 text-sm">Clear</button>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="bg-gray-900 rounded px-2 py-2 text-sm"
              value={sortBy.key}
              onChange={(e) => setSortBy((s) => ({ ...s, key: e.target.value }))}
            >
              <option value="market_cap">Market Cap</option>
              <option value="current_price">Price</option>
              <option value="price_change_percentage_24h">24h %</option>
              <option value="total_volume">Volume</option>
            </select>
            <button onClick={() => setSortBy((s) => ({ ...s, dir: s.dir === "asc" ? "desc" : "asc" }))} className="px-2 py-2 rounded bg-gray-700 text-sm">{sortBy.dir === "asc" ? "↑" : "↓"}</button>
            <button onClick={handleExportCsv} className="px-3 py-2 rounded bg-indigo-600 text-sm">Export CSV</button>
          </div>
        </div>

        {/* list header */}
        <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-2 pb-2 border-b border-gray-700/40">
          <div className="col-span-5">Name</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">24h</div>
          <div className="col-span-2 text-right">Market Cap</div>
          <div className="col-span-1 text-right">Spark</div>
        </div>

        {/* list body */}
        {loadingCoins ? (
          <div className="py-8 text-center text-gray-400">Loading coins…</div>
        ) : coinsError ? (
          <div className="py-6 text-center text-red-400">Error: {coinsError}</div>
        ) : (
          <div className="space-y-2 max-h-[580px] overflow-auto mt-3">
            {paged.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`grid grid-cols-12 gap-2 items-center p-2 rounded hover:bg-gray-700/30 cursor-pointer ${selected?.id === c.id ? "ring-1 ring-indigo-500" : ""}`}
              >
                <div className="col-span-5 flex items-center gap-3">
                  <img src={c.image} alt={c.symbol} className="w-6 h-6 rounded-full" />
                  <div>
                    <div className="text-sm text-white font-medium">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.symbol.toUpperCase()}</div>
                  </div>
                </div>
                <div className="col-span-2 text-right text-sm">${Number(c.current_price).toLocaleString()}</div>
                <div className={`col-span-2 text-right text-sm ${c.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>{c.price_change_percentage_24h?.toFixed(2)}%</div>
                <div className="col-span-2 text-right text-sm">${Number(c.market_cap).toLocaleString()}</div>
                <div className="col-span-1 text-right"><Sparkline data={c.sparkline_in_7d?.price || []} /></div>
                <div className="col-span-12 flex justify-end gap-2 mt-2 md:mt-0">
                  <button onClick={(e) => { e.stopPropagation(); toggleWatch(c.id); }} className={`px-2 py-1 text-xs rounded ${watchlist.includes(c.id) ? "bg-yellow-400 text-black" : "bg-gray-700 text-white"}`}>{watchlist.includes(c.id) ? "★ Watch" : "☆ Watch"}</button>
                  <button onClick={(e) => { e.stopPropagation(); setSelected(c); }} className="px-2 py-1 text-xs rounded bg-indigo-600">View</button>
                </div>
              </div>
            ))}
            {paged.length === 0 && <div className="py-6 text-center text-gray-400">No coins matched</div>}
          </div>
        )}

        {/* pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-400">Page {page} / {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 rounded bg-gray-700 text-sm">Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 rounded bg-gray-700 text-sm">Next</button>
          </div>
        </div>
      </div>

      {/* RIGHT: Chart + details */}
      <div className="w-full lg:w-[520px] bg-gray-900/60 rounded p-4 flex flex-col gap-3">
        {!selected ? (
          <div className="text-gray-400">Select a coin to view chart & details</div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selected.image} alt={selected.symbol} className="w-8 h-8 rounded" />
                <div>
                  <div className="text-white font-semibold">{selected.name}</div>
                  <div className="text-xs text-gray-400">{selected.symbol.toUpperCase()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">${Number(selected.current_price).toLocaleString()}</div>
                <div className={`text-xs ${selected.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>{selected.price_change_percentage_24h?.toFixed(2)}%</div>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {[1,7,30,90,180,365].map((d) => (
                <button key={d} onClick={() => setDays(d)} className={`px-2 py-1 rounded text-xs ${days === d ? "bg-indigo-600" : "bg-gray-800"}`}>{d}d</button>
              ))}
              <div className="ml-auto text-xs text-gray-400">Data: CoinGecko</div>
            </div>

            <div style={{ minHeight: 280 }} className="relative">
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">Loading chart…</div>
              ) : chartError ? (
                <div className="absolute inset-0 flex items-center justify-center text-red-400">Chart error: {chartError}</div>
              ) : chartJsData ? (
                <div style={{ height: 320 }}><Line data={chartJsData} options={chartOptions} /></div>
              ) : (
                <div className="text-gray-400">No chart data. Click View or select a coin.</div>
              )}
            </div>

            <div className="text-sm text-gray-300 pt-2">
              <div>Market Cap: ${Number(selected.market_cap).toLocaleString()}</div>
              <div>Total Volume: ${Number(selected.total_volume).toLocaleString()}</div>
              <div className="mt-2"><a href={`https://www.coingecko.com/en/coins/${selected.id}`} target="_blank" rel="noreferrer" className="text-indigo-400">Open on CoinGecko</a></div>
            </div>
          </>
        )}
      </div>

      {/* watchlist strip */}
      <div className="mt-4">
        <div className="text-sm text-gray-300 mb-2">Watchlist</div>
        <div className="flex gap-2 flex-wrap">
          {watchlist.length === 0 ? (
            <div className="text-gray-500 text-sm">No items in watchlist</div>
          ) : (
            watchlist.map((id) => {
              const c = coins.find((x) => x.id === id);
              if (!c) return null;
              return (
                <div key={id} className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded">
                  <img src={c.image} alt={c.symbol} className="w-5 h-5 rounded" />
                  <div className="text-sm">{c.symbol.toUpperCase()}</div>
                  <div className="text-sm text-gray-400">${Number(c.current_price).toLocaleString()}</div>
                  <button onClick={() => toggleWatch(id)} className="text-xs ml-2 text-red-400">Remove</button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data = [] }) {
  if (!data || data.length === 0) return <div className="text-xs text-gray-400">—</div>;
  const w = 80, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = max === min ? h / 2 : h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(" ");
  const stroke = data[data.length - 1] >= data[0] ? "#34d399" : "#f87171";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline fill="none" stroke={stroke} strokeWidth={1.5} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
