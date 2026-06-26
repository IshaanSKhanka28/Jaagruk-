"use client";

import { useState, useEffect, useCallback } from "react";
import { translations, Language, TranslationKey } from "@/lib/translations";

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>("en");

  const sync = useCallback(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("jaagruk_language") as Language | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  useEffect(() => {
    sync();
    // Keep every component using this hook in sync when the language changes
    window.addEventListener("jaagruk_settings_changed", sync);
    return () => window.removeEventListener("jaagruk_settings_changed", sync);
  }, [sync]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("jaagruk_language", lang);
    document.documentElement.lang = lang;
    // Notify other hook instances (navbar, home, panel, ...)
    window.dispatchEvent(new Event("jaagruk_settings_changed"));
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = translations[language] || translations.en;
      return dict[key] || translations.en[key] || key;
    },
    [language]
  );

  return { language, setLanguage, t };
}
