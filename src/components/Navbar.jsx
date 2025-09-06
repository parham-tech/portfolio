import React, { useState } from "react";

const Navbar = ({ theme, setTheme, setThemeForSection, removeSection, themeClasses, transMs, setTransMs, sectionThemes }) => {
  const [isOpen, setIsOpen] = useState(false); // Theme dropdown
  const [mobileOpen, setMobileOpen] = useState(false); // موبایل
  const [showTransitionControl, setShowTransitionControl] = useState(false); // panel ⚙️
  const links = ["Home", "about me", "Projects", "skills", "contact"];

  // تم فعلی hero (اگه کاربر فعال کرده باشه)
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
            className={`absolute left-0 mt-2 w-44 p-2 rounded-lg shadow-2xl transition-all duration-300 z-50 ${
              isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            {Object.keys(themeClasses).map((t) => (
              <li key={t} className="mb-1 last:mb-0 flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md flex items-center justify-between ${
                      theme === t ? "ring-2 ring-offset-2 ring-indigo-400" : ""
                    } ${themeClasses[t]}`}
                    onClick={() => {
                      setTheme(t); // تغییر تم کلی (site)
                      setIsOpen(false);
                    }}
                  >
                    <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                  </button>
                </div>

                {/* radio-like circle برای فعال‌سازی hero */}
                <div className="pl-2">
                  <button
                    aria-label={`Toggle hero background to ${t}`}
                    title={`Toggle ${t} on hero`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (heroCurrentTheme === t) {
                        // همون radio دوباره کلیک شد → خاموش بشه
                        removeSection?.("hero");
                      } else {
                        // اول hero رو خاموش کن بعد فقط این تم رو بزن
                        removeSection?.("hero");
                        setThemeForSection?.("hero", t);
                      }
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/40 hover:scale-105 transition-transform"
                  >
                    <span
                      className={`block w-4 h-4 rounded-full ${
                        heroCurrentTheme === t ? "bg-white" : "bg-transparent"
                      } transition-all`}
                    />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* دکمه ⚙️ تنظیمات */}
        <div className="relative">
          <button
            className={`px-3 py-2 rounded-lg cursor-pointer text-white shadow-lg transition-all duration-300 hover:scale-105 ${themeClasses[theme]}`}
            onClick={() => setShowTransitionControl((s) => !s)}
            aria-label="Transition settings"
          >
            ⚙️
          </button>

          {/* پنل کوچک اسلایدر */}
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
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/\s+/g, "")}`}
            className="text-white font-medium hover:text-yellow-200 transition-colors"
          >
            {link}
          </a>
        ))}
      </div>

      {/* موبایل - همبرگر */}
      <div className="md:hidden">
        <button onClick={() => setMobileOpen((s) => !s)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* منوی موبایل */}
      {mobileOpen && (
        <div className="absolute top-16 right-6 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col gap-4 md:hidden z-40">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "")}`}
              className="text-white hover:text-yellow-200"
              onClick={() => setMobileOpen(false)}
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
