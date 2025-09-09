// hooks/useThemeFadeMulti.jsx
import { useState, useRef, useEffect } from "react";

/**
 * useThemeFadeMulti
 * - initialTheme: تم اولیه
 * - transitionMs: مدت زمان transition (ms) — این مقدار می‌تواند از prop بالاتر تغییر کند
 * - initialSections: بخش‌هایی که از ابتدا باید لایه داشته باشند (مثلاً ["site"])
 */
export default function useThemeFadeMulti(
  initialTheme = "default",
  transitionMs = 700,
  initialSections = ["site"]
) {
  const [theme, setTheme] = useState(initialTheme);

  // مقداردهی اولیه لایه‌ها فقط برای بخش‌هایی که تو initialSections تعریف شدن
  const initialLayers = initialSections.reduce((acc, s) => {
    acc[s] = [{ id: `${s}_${Date.now()}`, theme: initialTheme, visible: true }];
    return acc;
  }, {});

  const [layers, setLayers] = useState(initialLayers);
  const timersRef = useRef([]);

  // تم مستقل هر بخش (برای radio در Navbar)
  const [sectionThemes, setSectionThemes] = useState(() => {
    return initialSections.reduce((acc, s) => {
      acc[s] = initialTheme;
      return acc;
    }, {});
  });

  useEffect(() => {
    return () => {
      // cleanup timers on unmount
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const addLayer = (section, newTheme) => {
    const id = `${section}_${Date.now()}`;
    setLayers((prev) => ({
      ...prev,
      [section]: [
        ...(prev[section] || []),
        { id, theme: newTheme, visible: false },
      ],
    }));

    setSectionThemes((prev) => ({ ...prev, [section]: newTheme }));

    // small delay to allow the element to mount, then toggle visibility to true -> triggers fade-in
    requestAnimationFrame(() => {
      const t1 = setTimeout(() => {
        setLayers((prev) => ({
          ...prev,
          [section]: (prev[section] || []).map((l) => ({
            ...l,
            visible: l.id === id,
          })),
        }));
      }, 20);

      // remove the previous layers that are not the active one after the transition completes
      const t2 = setTimeout(() => {
        setLayers((prev) => ({
          ...prev,
          [section]: (prev[section] || []).filter((l) => l.id === id),
        }));
        timersRef.current = timersRef.current.filter((x) => x !== t1 && x !== t2);
      }, transitionMs + 50);

      timersRef.current.push(t1, t2);
    });
  };

  /**
   * removeSection: حذف با fade-out
   * - ابتدا visible=false (fade-out)
   * - بعد از transitionMs، عنصر از لایه‌ها و sectionThemes حذف می‌شود
   */
  const removeSection = (section) => {
    setLayers((prev) => {
      if (!prev[section]) return prev; // nothing to remove
      return {
        ...prev,
        [section]: (prev[section] || []).map((l) => ({ ...l, visible: false })),
      };
    });

    // schedule actual deletion after transition finishes
    const t = setTimeout(() => {
      setLayers((prev) => {
        const copy = { ...prev };
        delete copy[section];
        return copy;
      });
      setSectionThemes((prev) => {
        const copy = { ...prev };
        delete copy[section];
        return copy;
      });
      timersRef.current = timersRef.current.filter((x) => x !== t);
    }, transitionMs + 50);

    timersRef.current.push(t);
  };

  // تغییر تم کلی (سایت و همه بخش‌های فعال)
  const setThemeWithFade = (newTheme) => {
    if (newTheme === theme) return;
    setTheme(newTheme);
    Object.keys(layers).forEach((section) => addLayer(section, newTheme));
  };

  // تغییر تم فقط برای یک بخش مشخص (مثلاً hero)
  const setThemeForSection = (section, newTheme) => {
    if (!section) return;
    addLayer(section, newTheme);
  };

  const durationStyle = { transitionDuration: `${transitionMs}ms` };

  return {
    theme,
    setThemeWithFade,
    setThemeForSection,
    removeSection, // حالا با fade-out واقعی
    layers,
    sectionThemes,
    durationStyle,
  };
}
