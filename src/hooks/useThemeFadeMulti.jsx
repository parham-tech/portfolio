import { useState, useRef, useEffect } from "react";

/**
 * useThemeFadeMulti
 * - initialTheme: تم اولیه
 * - transitionMs: مدت زمان transition (ms)
 * - initialSections: بخش‌هایی که از ابتدا باید بک‌گراند داشته باشن (مثلاً ["site"])
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
    return () => timersRef.current.forEach(clearTimeout);
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

  // حذف کامل یک بخش (مثلاً hero)
  const removeSection = (section) => {
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
    removeSection,
    layers,
    sectionThemes,
    durationStyle,
  };
}
