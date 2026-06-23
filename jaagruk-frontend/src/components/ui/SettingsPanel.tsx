"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  X,
  Sun,
  Moon,
  Monitor,
  Globe,
  Settings,
  Accessibility,
  CheckCircle2,
  Info,
} from "lucide-react";
import { SupportedLanguage } from "@/lib/translations";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇮🇳" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳" },
  { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // States for LocalStorage Settings
  const [fontSize, setFontSize] = useState("medium");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [colorblind, setColorblind] = useState("none");
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from LocalStorage
    setFontSize(localStorage.getItem("jaagruk_fontsize") || "medium");
    setReducedMotion(localStorage.getItem("jaagruk_reduced_motion") === "true");
    setHighContrast(localStorage.getItem("jaagruk_high_contrast") === "true");
    setLanguage((localStorage.getItem("jaagruk_language") as SupportedLanguage) || "en");
    setColorblind(localStorage.getItem("jaagruk_colorblind") || "none");
    setScreenReader(localStorage.getItem("jaagruk_screenreader") === "true");
  }, []);

  // Update Settings in LocalStorage & dispatch global refresh event
  const updateSetting = (key: string, value: string | boolean) => {
    localStorage.setItem(key, String(value));
    // Trigger listeners
    window.dispatchEvent(new Event("jaagruk_settings_changed"));
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-[9900]"
          />

          {/* Settings Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="fixed top-0 right-0 h-full w-[320px] bg-background border-l border-border z-[9910] overflow-y-auto p-6 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">Preferences</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-sm border border-border/80 hover:bg-surface hover:border-border-hover transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* SECTION 1: APPEARANCE */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" /> Appearance
                </h3>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-muted font-semibold">Theme Mode</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 border border-border/80 rounded-sm bg-background/50">
                    {[
                      { value: "light", icon: Sun, label: "Light" },
                      { value: "dark", icon: Moon, label: "Dark" },
                      { value: "system", icon: Monitor, label: "System" },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = theme === item.value;
                      return (
                        <button
                          key={item.value}
                          onClick={() => setTheme(item.value)}
                          className={`flex flex-col items-center gap-1 py-2 text-[10px] font-bold rounded-sm transition-all ${
                            isActive
                              ? "bg-[#1D4ED8] text-white"
                              : "text-muted hover:text-foreground hover:bg-surface"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Size Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-muted font-semibold">Text Size</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { size: "small", label: "A (Small)" },
                      { size: "medium", label: "A (Medium)" },
                      { size: "large", label: "A (Large)" },
                    ].map((item) => {
                      const isActive = fontSize === item.size;
                      return (
                        <button
                          key={item.size}
                          onClick={() => {
                            setFontSize(item.size);
                            updateSetting("jaagruk_fontsize", item.size);
                          }}
                          className={`py-2 text-[10px] font-bold border rounded-sm transition-all ${
                            isActive
                              ? "border-[#1D4ED8] bg-[#1D4ED8]/10 text-primary"
                              : "border-border/80 text-muted hover:text-foreground hover:bg-surface"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reduced Motion Switch */}
                <div className="flex items-center justify-between py-1.5 border-t border-border/30">
                  <label htmlFor="reduced-motion-toggle" className="text-xs text-foreground font-semibold">Reduce Motion</label>
                  <button
                    id="reduced-motion-toggle"
                    onClick={() => {
                      const val = !reducedMotion;
                      setReducedMotion(val);
                      updateSetting("jaagruk_reduced_motion", val);
                    }}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                      reducedMotion ? "bg-[#1D4ED8]" : "bg-border"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        reducedMotion ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* High Contrast Switch */}
                <div className="flex items-center justify-between py-1.5 border-t border-border/30">
                  <label htmlFor="high-contrast-toggle" className="text-xs text-foreground font-semibold">High Contrast</label>
                  <button
                    id="high-contrast-toggle"
                    onClick={() => {
                      const val = !highContrast;
                      setHighContrast(val);
                      updateSetting("jaagruk_high_contrast", val);
                    }}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                      highContrast ? "bg-[#1D4ED8]" : "bg-border"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        highContrast ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* SECTION 2: LANGUAGE */}
              <div className="space-y-4 pt-2 border-t border-border/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Language
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((lang) => {
                    const isActive = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as SupportedLanguage);
                          updateSetting("jaagruk_language", lang.code);
                        }}
                        className={`flex items-center gap-2 p-2.5 text-xs font-semibold rounded-sm border transition-all ${
                          isActive
                            ? "border-[#1D4ED8] bg-[#1D4ED8]/10 text-primary font-bold shadow-sm"
                            : "border-border bg-background hover:bg-surface"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: ACCESSIBILITY */}
              <div className="space-y-4 pt-2 border-t border-border/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Accessibility className="w-3.5 h-3.5" /> Accessibility
                </h3>

                {/* Color Blind Mode */}
                <div className="space-y-2">
                  <label htmlFor="colorblind-selector" className="text-xs text-muted font-semibold">Color Blind Mode</label>
                  <select
                    id="colorblind-selector"
                    value={colorblind}
                    onChange={(e) => {
                      setColorblind(e.target.value);
                      updateSetting("jaagruk_colorblind", e.target.value);
                    }}
                    className="w-full h-9 px-3 text-xs rounded-sm border border-border bg-background focus:outline-none"
                  >
                    <option value="none">None</option>
                    <option value="deuteranopia">Deuteranopia (Green-Weak)</option>
                    <option value="protanopia">Protanopia (Red-Weak)</option>
                    <option value="tritanopia">Tritanopia (Blue-Weak)</option>
                  </select>
                </div>

                {/* Screen Reader Hints Switch */}
                <div className="flex items-center justify-between py-1.5 border-t border-border/30">
                  <label htmlFor="screenreader-toggle" className="text-xs text-foreground font-semibold">Enhanced Screen Reader</label>
                  <button
                    id="screenreader-toggle"
                    onClick={() => {
                      const val = !screenReader;
                      setScreenReader(val);
                      updateSetting("jaagruk_screenreader", val);
                    }}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                      screenReader ? "bg-[#1D4ED8]" : "bg-border"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        screenReader ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer / About Section */}
            <div className="pt-6 border-t border-border/60 space-y-3">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold">About Jaagruk</span>
              </div>
              <div className="text-[10px] text-muted space-y-1">
                <div>Version: <span className="font-mono text-foreground font-bold">v1.0.0 — Hackathon Build</span></div>
                <div className="text-[#F97316] font-bold font-mono tracking-wide uppercase text-[10px] mt-1">"See it. Report it. Fix it."</div>
                <div className="text-muted/80">Built for Vibe2Ship Hackathon 2025</div>
              </div>
              <div className="pt-2">
                <a
                  href="https://github.com/IshaanSKhanka28/Jaagruk-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors font-semibold"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
