import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import useThemeFadeMultiUltra from "./hooks/useThemeFadeMulti";
import Hero from "./components/Hero";

function App() {
  const [transMs, setTransMs] = useState(700);

  const {
    theme,
    setThemeWithFade,
    setThemeForSection,
    removeSection,
    layers,
    sectionThemes,
    durationStyle,
  } = useThemeFadeMultiUltra("default", transMs, ["site"]);

  const themeClasses = {
    default: "bg-day-gradient",
    retro: "bg-green-gradient",
    cyberpunk: "bg-purple-gradient",
    valentine: "bg-pink-gradient",
    dark: "bg-gray-900",
  };

  const heroClasses = {
    default: "bg-hero-day",
    retro: "bg-hero-green",
    cyberpunk: "bg-hero-purple",
    valentine: "bg-hero-pink",
    dark: "bg-gray-800",
  };

  return (
    <Router>
      {/* بک‌گراند سایت */}
      {layers.site?.map((l) => (
        <div
          key={l.id}
          className={`absolute inset-0 pointer-events-none transition-opacity ${l.visible ? "opacity-100" : "opacity-0"} ${themeClasses[l.theme]}`}
          style={durationStyle}
        />
      ))}

      <div className="relative z-10 min-h-screen">
        {/* Navbar */}
        <Navbar
          theme={theme}
          setTheme={setThemeWithFade}
          setThemeForSection={setThemeForSection}
          removeSection={removeSection}
          themeClasses={themeClasses}
          transMs={transMs}
          setTransMs={setTransMs}
          layers={layers}
          sectionThemes={sectionThemes}
        />

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Hero فقط روی صفحه Home */}
                <div className="relative min-h-[60vh] overflow-hidden mt-6">
                  {layers.hero?.map((l) => (
                    <div
                      key={l.id}
                      className={`absolute inset-0 transition-opacity ${l.visible ? "opacity-100" : "opacity-0"} ${heroClasses[l.theme]}`}
                      style={durationStyle}
                    />
                  ))}
                  <div className="relative z-10">
                    <Hero />
                  </div>
                </div>
                <Home />
              </>
            }
          />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
