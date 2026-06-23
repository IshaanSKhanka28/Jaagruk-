"use client";

import { useState, useEffect, useCallback } from "react";

export function useAccessibility() {
  const [fontSize, setFontSize] = useState("medium");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [colorblind, setColorblind] = useState("none");
  const [screenReader, setScreenReader] = useState(false);

  const updateSettings = useCallback(() => {
    if (typeof window !== "undefined") {
      setFontSize(localStorage.getItem("jaagruk_fontsize") || "medium");
      setReducedMotion(localStorage.getItem("jaagruk_reduced_motion") === "true");
      setHighContrast(localStorage.getItem("jaagruk_high_contrast") === "true");
      setColorblind(localStorage.getItem("jaagruk_colorblind") || "none");
      setScreenReader(localStorage.getItem("jaagruk_screenreader") === "true");
    }
  }, []);

  useEffect(() => {
    updateSettings();
    window.addEventListener("jaagruk_settings_changed", updateSettings);
    return () => window.removeEventListener("jaagruk_settings_changed", updateSettings);
  }, [updateSettings]);

  return {
    fontSize,
    reducedMotion,
    highContrast,
    colorblind,
    screenReader,
  };
}
