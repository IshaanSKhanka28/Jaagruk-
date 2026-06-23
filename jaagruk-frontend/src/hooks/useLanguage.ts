"use client";

import { useState, useEffect, useCallback } from "react";
import { TRANSLATIONS, SupportedLanguage, Translations } from "@/lib/translations";

export function useLanguage() {
  const [lang, setLang] = useState<SupportedLanguage>("en");

  const updateLanguage = useCallback(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jaagruk_language") as SupportedLanguage;
      if (stored && TRANSLATIONS[stored]) {
        setLang(stored);
      }
    }
  }, []);

  useEffect(() => {
    updateLanguage();
    window.addEventListener("jaagruk_settings_changed", updateLanguage);
    return () => window.removeEventListener("jaagruk_settings_changed", updateLanguage);
  }, [updateLanguage]);

  const t = useCallback(
    (key: keyof Translations): string => {
      const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
      return dict[key] || TRANSLATIONS.en[key] || key;
    },
    [lang]
  );

  return { t, language: lang };
}
