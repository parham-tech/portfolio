import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import useThemeFadeMultiUltra from "./hooks/useThemeFadeMulti";

function App() {
  const [transMs, setTransMs] = useState(700);

  const {
    theme,
    setThemeWithFade,
    setThemeForSection,
    removeSection, // اضافه شده
    layers,
    sectionThemes, // تم‌های مستقل هر بخش
    durationStyle,
  } = useThemeFadeMultiUltra("default", transMs, ["site"]); 
  // ⚠️ اینجا فقط site رو مقداردهی اولیه می‌کنیم
  // => hero دیفالت لایه نداره مگر اینکه کاربر خودش فعالش کنه

  const themeClasses = {
    default: "bg-day-gradient",
    retro: "bg-green-gradient",
    cyberpunk: "bg-purple-gradient",
    valentine: "bg-pink-gradient",
    aqua: "bg-blue-gradient",
    dark: "bg-gray-900",
  };

  const heroClasses = {
    default: "bg-hero-day",
    retro: "bg-hero-green",
    cyberpunk: "bg-hero-purple",
    valentine: "bg-hero-pink",
    aqua: "bg-hero-blue",
    dark: "bg-gray-800",
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* بک‌گراند سایت */}
      {layers.site?.map((l) => (
        <div
          key={l.id}
          className={`absolute inset-0 pointer-events-none transition-opacity ${
            l.visible ? "opacity-100" : "opacity-0"
          } ${themeClasses[l.theme]}`}
          style={durationStyle}
        />
      ))}

      <div className="relative z-10">
        {/* Navbar */}
        <Navbar
          theme={theme}
          setTheme={setThemeWithFade}
          setThemeForSection={setThemeForSection}
          removeSection={removeSection} // پاس دادن برای خاموش کردن hero
          themeClasses={themeClasses}
          transMs={transMs}
          setTransMs={setTransMs}
          layers={layers}
          sectionThemes={sectionThemes} // پاس دادن تم‌های بخش‌ها
        />

        {/* Hero (فقط وقتی کاربر فعالش کرده باشه) */}
        <div className="relative min-h-[60vh] overflow-hidden mt-6">
          {layers.hero?.map((l) => (
            <div
              key={l.id}
              className={`absolute inset-0 transition-opacity ${
                l.visible ? "opacity-100" : "opacity-0"
              } ${heroClasses[l.theme]}`}
              style={durationStyle}
            />
          ))}
          <div className="relative z-10">
            <Hero />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
