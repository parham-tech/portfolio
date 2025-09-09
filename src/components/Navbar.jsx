import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({
  theme,
  setTheme,
  setThemeForSection,
  removeSection,
  themeClasses,
  transMs,
  setTransMs,
  sectionThemes,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Theme dropdown
  const [mobileOpen, setMobileOpen] = useState(false); // موبایل
  const [showTransitionControl, setShowTransitionControl] = useState(false); // پنل ⚙️

  const links = [
    { name: "Home", path: "/" },
    { name: "About Me", path: "/about" },
    { name: "Projects", path: "/projects" },
    { name: "Skills", path: "/skills" },
    { name: "Contact", path: "/contact" },
  ];

  // تم فعلی hero (اگه فعال باشد)
  const heroCurrentTheme = sectionThemes?.hero || null;

  return (
    <nav className="w-full flex items-center justify-between p-6 bg-transparent relative z-20">
      {/* سمت چپ: Theme + ⚙️ */}
      <div className="flex items-center gap-2">
        {/* Theme دکمه */}
        <div className="relative">
          <div
            role="button"
            className={`px-4 py-2 rounded-lg text-white cursor-pointer flex items-center justify-between shadow-lg transition-all duration-500 hover:scale-105 ${themeClasses[theme]}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            Theme
            <svg
              width="12px"
              height="12px"
              className={`inline-block h-3 w-3 fill-current opacity-80 ml-2 transform transition-transform duration-300 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2048 2048"
            >
              <path d="M1799 349l242 241-1017 1az017L7 590l242-241 775 775 775-775z"></path>
            </svg>
          </div>

          {/* Dropdown Theme */}
          <ul
            className={`absolute left-0 mt-2 w-52 p-2 rounded-lg shadow-2xl transition-all duration-300 z-50 ${
              isOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            {Object.keys(themeClasses).map((t) => (
              <li key={t} className="mb-1 last:mb-0 flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300 flex items-center justify-between ${
                      theme === t ? "ring-2 ring-offset-2 ring-indigo-400" : ""
                    } ${themeClasses[t]}`}
                    onClick={() => {
                      setTheme(t);
                      setIsOpen(false);
                    }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                </div>

                {/* radio برای Hero */}
                <div className="pl-2">
                  <button
                    aria-label={`Toggle hero background to ${t}`}
                    title={
                      theme !== t
                        ? "Only the current site theme can be applied to Hero"
                        : heroCurrentTheme === t
                        ? "Click again to reset Hero"
                        : `Toggle ${t} on Hero`
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (theme !== t) return; // فقط تم سایت قابل فعال سازی است
                      if (heroCurrentTheme === t) {
                        removeSection?.("hero");
                      } else {
                        setThemeForSection?.("hero", t);
                      }
                    }}
                    disabled={theme !== t}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/40 transition-transform
                      ${theme !== t ? "opacity-40 cursor-not-allowed" : "hover:scale-105"}`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full relative transition-all duration-300
                        transform ${heroCurrentTheme === t ? "scale-110 bg-white" : theme !== t ? "bg-gray-600/50 scale-100" : "bg-transparent scale-100"}`}
                    >
                      {theme !== t && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="absolute w-3 h-3 text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        >
                          <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-6V8a6 6 0 10-12 0v3H4v12h16V11h-2zm-8 0V8a4 4 0 118 0v3H10z" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ⚙️ تنظیمات transition */}
        <div className="relative">
          <button
            className={`px-3 py-2 rounded-lg cursor-pointer text-white shadow-lg transition-all duration-300 hover:scale-105 ${themeClasses[theme]}`}
            onClick={() => setShowTransitionControl((s) => !s)}
            aria-label="Transition settings"
          >
            ⚙️
          </button>

          <div
            className={`absolute top-full mt-1 left-0 w-48 p-2 bg-gray-800 rounded shadow-lg z-50 transform transition-all duration-200 origin-top-left
              ${showTransitionControl ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}`}
            style={{ transformOrigin: "top left" }}
          >
            <label className="text-white text-sm flex flex-col gap-1">
              Transition: {transMs} ms
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={transMs}
                onChange={(e) => setTransMs(Number(e.target.value))}
                className="w-full"
              />
            </label>
          </div>
        </div>
      </div>

      {/* سمت راست: لینک‌ها */}
      <div className="hidden md:flex gap-6 items-center">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="text-white font-medium hover:text-yellow-200 transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* موبایل */}
      <div className="md:hidden">
        <button onClick={() => setMobileOpen((s) => !s)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-16 right-6 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col gap-4 md:hidden z-40">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-white hover:text-yellow-200"
              onClick={() => setMobileOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
