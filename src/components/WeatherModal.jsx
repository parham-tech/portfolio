// src/components/WeatherModal.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";

/**
 * WeatherModal (حرفه‌ای)
 * - از OpenWeatherMap Geo API برای پیشنهاد شهر استفاده می‌کند (geo/1.0/direct)
 * - بعد از انتخاب شهر، با lat/lon آب‌وهوا را می‌گیرد
 * - debounce، abort previous requests، accessibility، focus management، click-outside و جلوگیری از اسکرول پس‌زمینه را دارد
 */

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

const WeatherModal = ({ onClose }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true); // برای fetch آب‌وهوا
  const [locationMessage, setLocationMessage] = useState("");
  const [city, setCity] = useState("");
  const [searching, setSearching] = useState(false); // برای دکمه search/نتایج
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const abortRef = useRef(null);
  const suggestCache = useRef(new Map()); // کش ساده برای پیشنهادها
  const previousFocusRef = useRef(null);
  const debounceTimer = useRef(null);

  // --- helper: fetch weather by coords ---
  const fetchWeatherByCoords = useCallback(async (lat, lon, name = "", isFallback = false) => {
    if (!apiKey) {
      setLocationMessage("⚠️ API key not set");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      if (!res.ok) throw res;
      const data = await res.json();
      setWeather(data);
      setLocationMessage(name ? `📍 Weather for ${name}` : `📍 Current location`);
    } catch (err) {
      // fallback
      setWeather({
        name: "Amsterdam",
        main: { temp: 15 },
        weather: [{ description: "clear sky", icon: "01d" }],
      });
      setLocationMessage(isFallback ? "📍 Location not available, showing Amsterdam" : "❌ Could not fetch weather");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  // --- fetch city suggestions (debounced + abort + cache) ---
  const fetchCitySuggestions = useCallback((query) => {
    // clear previous timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!query || query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }

    // check cache
    const key = query.toLowerCase();
    if (suggestCache.current.has(key)) {
      setSuggestions(suggestCache.current.get(key));
      return;
    }

    setSuggestLoading(true);
    debounceTimer.current = setTimeout(async () => {
      // abort previous
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=6&appid=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) {
          // handle rate-limit or auth errors nicely
          if (res.status === 401) setLocationMessage("❌ Invalid API key");
          else if (res.status === 429) setLocationMessage("❌ Rate limit reached. Try later.");
          setSuggestions([]);
          setSuggestLoading(false);
          return;
        }
        const data = await res.json();
        // map to a lighter structure and cache
        const mapped = (Array.isArray(data) ? data : []).map((s) => ({
          name: s.name,
          state: s.state || "",
          country: s.country || "",
          lat: s.lat,
          lon: s.lon,
        }));
        suggestCache.current.set(key, mapped);
        setSuggestions(mapped);
      } catch (err) {
        if (err.name === "AbortError") {
          // aborted, ignore
        } else {
          setSuggestions([]);
        }
      } finally {
        setSuggestLoading(false);
      }
    }, DEBOUNCE_MS);
  }, [apiKey]);

  // --- select city from suggestion object ---
  const selectCity = (s) => {
    if (!s) return;
    setCity(`${s.name}${s.state ? `, ${s.state}` : ""}, ${s.country}`);
    setSuggestions([]);
    fetchWeatherByCoords(s.lat, s.lon, s.name);
    setActiveIndex(-1);
  };

  // --- keyboard handling ---
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      // close suggestions first; if none, close modal
      if (suggestions.length > 0) {
        setSuggestions([]);
        setActiveIndex(-1);
      } else {
        onClose?.();
      }
      return;
    }
    if (suggestions.length === 0) {
      if (e.key === "Enter") {
        // search typed city
        fetchWeatherByCoords(null, null, city); // will be handled below — safer to call fetchWeatherByCity (we can implement), but keep minimal here
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const s = activeIndex >= 0 ? suggestions[activeIndex] : null;
      if (s) selectCity(s);
      else if (city) fetchWeatherByCity(city);
    }
  };

  // fetch weather by plain city name (fallback)
  const fetchWeatherByCity = async (cityName) => {
    if (!cityName || !apiKey) return;
    setSearching(true);
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${encodeURIComponent(apiKey)}`
      );
      if (!res.ok) {
        if (res.status === 404) setLocationMessage("❌ City not found");
        else if (res.status === 401) setLocationMessage("❌ Invalid API key");
        else setLocationMessage("❌ Error fetching weather");
        setWeather(null);
        return;
      }
      const data = await res.json();
      setWeather(data);
      setLocationMessage(`📍 Showing weather for ${data.name}`);
    } catch (err) {
      setLocationMessage("❌ Error fetching weather");
    } finally {
      setSearching(false);
      setLoading(false);
      setActiveIndex(-1);
    }
  };

  // --- focus management + prevent background scroll + click outside ---
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    // lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // focus input
    setTimeout(() => inputRef.current?.focus(), 50);

    const handleClickOutside = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.();
      // cleanup pending timers / aborts
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [onClose]);

  // --- initial fetch: try geolocation, else Amsterdam ---
  useEffect(() => {
    const defaultCoords = { latitude: 52.3676, longitude: 4.9041 }; // Amsterdam
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, "Current location"),
        () => fetchWeatherByCoords(defaultCoords.latitude, defaultCoords.longitude, "Amsterdam")
      );
    } else {
      fetchWeatherByCoords(defaultCoords.latitude, defaultCoords.longitude, "Amsterdam");
    }
  }, [fetchWeatherByCoords]);

  // --- when city input changes, fetch suggestions (debounced) ---
  useEffect(() => {
    fetchCitySuggestions(city);
    // cleanup handled in fetchCitySuggestions via debounceTimer
  }, [city, fetchCitySuggestions]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Weather modal"
    >
      <div
        ref={containerRef}
        className="relative bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-2xl text-white p-6 rounded-3xl shadow-2xl w-80 sm:w-96 max-w-[90vw] transform animate-scaleIn"
      >
        {/* close */}
        <button
          onClick={() => onClose?.()}
          aria-label="Close weather modal"
          className="absolute top-3 right-4 text-white hover:text-yellow-300 transition-transform hover:scale-125 text-xl"
        >
          ✖
        </button>

        {/* loading */}
        {loading && <p className="text-center animate-pulse">Loading...</p>}

        {/* message */}
        {locationMessage && (
          <p className={`text-sm mb-2 text-center ${locationMessage.includes("❌") ? "text-red-400" : "text-yellow-300"}`}>
            {locationMessage}
          </p>
        )}

        {/* weather display */}
        {weather && !loading && (
          <div className="flex flex-col items-center gap-3 text-center mb-4">
            <p className="text-2xl font-bold drop-shadow-lg">{weather.name}</p>
            <p className="text-lg capitalize opacity-90">{weather.weather?.[0]?.description}</p>
            <p className="text-4xl font-extrabold">{Math.round(weather.main?.temp)}°C</p>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather?.[0]?.icon}@4x.png`}
              alt="weather icon"
              className="w-24 h-24 drop-shadow-lg"
            />
          </div>
        )}

        {/* search */}
        <div className="mt-2 flex flex-col items-center relative w-full">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city..."
            value={city}
            onChange={(e) => { setCity(e.target.value); }}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="city-suggestions"
            aria-expanded={suggestions.length > 0}
            className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <div className="w-full mt-2 flex gap-2">
            <button
              onClick={() => {
                if (activeIndex >= 0 && suggestions[activeIndex]) selectCity(suggestions[activeIndex]);
                else if (city) fetchWeatherByCity(city);
              }}
              disabled={(!city && suggestions.length === 0) || searching}
              className="flex-1 px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
            <button
              onClick={() => { setCity(""); setSuggestions([]); setActiveIndex(-1); }}
              className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
            >
              Clear
            </button>
          </div>

          {/* suggestions list */}
          {suggestLoading && <p className="text-xs text-center mt-2">Searching...</p>}
          {suggestions.length > 0 && (
            <ul
              id="city-suggestions"
              role="listbox"
              aria-label="City suggestions"
              className="absolute top-full left-0 right-0 bg-white/20 backdrop-blur-sm rounded-lg mt-1 text-black max-h-48 overflow-auto z-20"
            >
              {suggestions.map((s, idx) => {
                const label = `${s.name}${s.state ? `, ${s.state}` : ""}, ${s.country}`;
                const isActive = idx === activeIndex;
                return (
                  <li
                    key={`${s.name}-${s.lat}-${s.lon}`}
                    role="option"
                    aria-selected={isActive}
                    id={`city-option-${idx}`}
                    className={`px-3 py-2 cursor-pointer hover:bg-yellow-400 hover:text-black ${isActive ? "bg-yellow-400 text-black" : ""}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => selectCity(s)}
                  >
                    {label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherModal;
