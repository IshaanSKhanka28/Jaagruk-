"use client";

import React, { useEffect, useState, useCallback } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AnimatePresence, MotionConfig } from "framer-motion";

export function ClientLoadingWrapper({ children }: { children: React.ReactNode }) {
  const [showLoading, setShowLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const applyAccessibilitySettings = useCallback(() => {
    if (typeof window === "undefined") return;

    // 1. Font Size Multiplier
    const size = localStorage.getItem("jaagruk_fontsize") || "medium";
    document.documentElement.style.fontSize =
      size === "small" ? "0.9rem" : size === "large" ? "1.1rem" : "1rem";

    // 2. High Contrast Class Toggle
    const contrast = localStorage.getItem("jaagruk_high_contrast") === "true";
    document.documentElement.classList.toggle("high-contrast", contrast);

    // 3. Color Blind Filter Activation
    const colorblindVal = localStorage.getItem("jaagruk_colorblind") || "none";
    if (colorblindVal === "none") {
      document.documentElement.style.filter = "none";
    } else {
      document.documentElement.style.filter = `url(#${colorblindVal})`;
    }

    // 4. Reduced Motion State Toggle (kills framer-motion via MotionConfig
    //    AND CSS transitions/animations via the .reduce-motion class)
    const isReduced = localStorage.getItem("jaagruk_reduced_motion") === "true";
    setReducedMotion(isReduced);
    document.documentElement.classList.toggle("reduce-motion", isReduced);

    // 5. Screen Reader Attribute
    const isScreenReader = localStorage.getItem("jaagruk_screenreader") === "true";
    document.documentElement.setAttribute("data-screenreader", String(isScreenReader));

    // 6. Accent Color
    const ACCENTS: Record<string, string> = {
      orange: "#F97316",
      blue: "#3B82F6",
      green: "#22C55E",
      purple: "#7C3AED",
      red: "#EF4444",
      pink: "#EC4899",
    };
    const accent = localStorage.getItem("jaagruk_accent");
    if (accent && ACCENTS[accent]) {
      document.documentElement.style.setProperty("--color-accent", ACCENTS[accent]);
      document.documentElement.style.setProperty("--color-accent-hover", ACCENTS[accent]);
    } else {
      // Restore theme default
      document.documentElement.style.removeProperty("--color-accent");
      document.documentElement.style.removeProperty("--color-accent-hover");
    }

    // 7. Language attribute
    const lang = localStorage.getItem("jaagruk_language");
    if (lang) document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    setMounted(true);
    setShowLoading(true);

    // Bind setting change triggers
    applyAccessibilitySettings();
    window.addEventListener("jaagruk_settings_changed", applyAccessibilitySettings);
    return () => window.removeEventListener("jaagruk_settings_changed", applyAccessibilitySettings);
  }, [applyAccessibilitySettings]);

  return (
    <MotionConfig transition={reducedMotion ? { duration: 0 } : undefined}>
      {/* Invisible SVG containing Accessibility Color Matrices */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <defs>
          <filter id="protanopia">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0"
            />
          </filter>
        </defs>
      </svg>

      <AnimatePresence mode="wait">
        {showLoading && (
          <LoadingScreen key="loader" onComplete={() => setShowLoading(false)} />
        )}
      </AnimatePresence>
      {children}
    </MotionConfig>
  );
}
