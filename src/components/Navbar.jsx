// components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTransitionControl, setShowTransitionControl] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Skills", path: "/skills" },
    { name: "Contact", path: "/contact" },
  ];

  const location = useLocation();

  // تعیین section فعال بر اساس مسیر فعلی
  const currentSection = (() => {
    if (location.pathname === "/") return "hero";
    if (location.pathname === "/skills") return "skills";
    return null; // در صفحات دیگر هیچ section‌ای برای radio فعال نیست
  })();

  const heroCurrentTheme = sectionThemes?.hero || null;
  const skillsCurrentTheme = sectionThemes?.skills || null;

  return (
    <nav className="w-full flex items-center justify-between p-6 bg-transparent relative z-20">
      {/* سمت چپ: Theme + ⚙️ */}
      <div className="flex items-center gap-2">
        {/* Theme dropdown */}
        <div className="relative">
          <div
            role="button"
            className={`px-4 py-2 rounded-lg text-white cursor-pointer flex items-center justify-between shadow-lg transition-all duration-500 hover:scale-105 ${themeClasses[theme]}`}
            onClick={() => setIsOpen((s) => !s)}
          >
            Theme
            <span className="ml-3 text-xs opacity-90">
             
            </span>
          </div>

          <ul
            className={`absolute -left-2 mt-2 w-48 p-2 rounded-lg shadow-2xl transition-all duration-300 z-50 ${
              isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            {Object.keys(themeClasses).map((t) => {
              // مشخص کردن تم فعالِ section فعلی برای نمایش وضعیت radio
              const isActiveForCurrent = currentSection === "hero" ? heroCurrentTheme === t
                : currentSection === "skills" ? skillsCurrentTheme === t
                : false;

              // آیا radio باید قفل باشد؟
              // شرط: فقط وقتی تم سایت == t اجازه اعمال روی section داده می‌شود (مثل قبلاً)
              const isLocked = theme !== t || !currentSection;

              return (
                <li key={t} className="mb-2 last:mb-0 flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <button
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300 flex items-center justify-between ${theme === t ? "ring-2 ring-offset-2 ring-indigo-400" : ""} ${themeClasses[t]}`}
                      onClick={() => {
                        // تغییر تم کلی سایت (site)
                        setTheme(t);
                        setIsOpen(false);
                      }}
                    >
                      <span className="capitalize">{t}</span>
                    </button>
                  </div>

                  {/* single radio used for whichever section is active (Home or Skills) */}
                  <div className="pl-2 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!currentSection) return; // اگر هیچ section فعالی نیست کاری نکن
                        if (theme !== t) return; // lock behavior (اگر نخوای lock حذف کن)
                        // toggle برای section فعال
                        const section = currentSection;
                        const currentForSection = section === "hero" ? heroCurrentTheme : skillsCurrentTheme;
                       if (currentSection === "skills") {
  // همیشه ست کن، ولی خاموش نکن
  setThemeForSection?.(section, t);
} else {
  // Hero و بقیه سکشن‌ها toggle باشن
  if (currentForSection === t) {
    removeSection?.(section);
  } else {
    setThemeForSection?.(section, t);
  }
}

                      }}
                      disabled={isLocked}
                      title={
                        !currentSection
                          ? "Go to Home or Skills page to apply this to a section"
                          : theme !== t
                          ? "Site theme must match this theme to apply to section"
                          : isActiveForCurrent
                          ? "Click again to reset this section"
                          : `Apply ${t} to ${currentSection === "hero" ? "Hero" : "Skills"}`
                      }
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/40 transition-transform
                        ${isLocked ? "opacity-40 cursor-not-allowed" : "hover:scale-105"}`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full relative transition-all duration-300
                          ${isActiveForCurrent ? "bg-white scale-110" : "bg-transparent scale-100"}`}
                      />
                      {/* lock icon overlay */}
                      {isLocked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="absolute w-4 h-4 text-white opacity-90"
                        >
                          <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-6V8a6 6 0 10-12 0v3H4v12h16V11h-2zm-8 0V8a4 4 0 118 0v3H10z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
            {/* hint پایین dropdown */}
            <li className="mt-2 text-xs text-gray-300">
              {/* Hint: Open Home or Skills, then choose site theme and click the small radio to apply it to that section. */}
            </li>
          </ul>
        </div>

        {/* ⚙️ Transition */}
        <div className="relative">
          <button
            className={`px-3 py-2 rounded-lg cursor-pointer text-white shadow-lg transition-all duration-300 hover:scale-105 ${themeClasses[theme]}`}
            onClick={() => setShowTransitionControl((s) => !s)}
          >
            ⚙️
          </button>

          <div
            className={`absolute top-full mt-1 left-0 w-48 p-2 bg-gray-800 rounded shadow-lg z-50 transform transition-all duration-200 origin-top-left ${
              showTransitionControl ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
            }`}
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
          <Link key={link.name} to={link.path} className="text-white font-medium hover:text-yellow-200 transition-colors">
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

      {/* منوی موبایل */}
      {mobileOpen && (
        <div className="absolute top-16 right-6 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col gap-4 md:hidden z-40">
          {links.map((link) => (
            <Link key={link.name} to={link.path} className="text-white hover:text-yellow-200" onClick={() => setMobileOpen(false)}>
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
