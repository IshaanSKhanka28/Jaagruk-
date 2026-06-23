"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] border border-border hover:border-border-hover hover:bg-surface transition-all"
      style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
      aria-label={`Current theme: ${theme}. Click to switch.`}
      id="theme-toggle"
    >
      {theme === "light" && <Sun className="w-4 h-4 text-foreground" />}
      {theme === "dark" && <Moon className="w-4 h-4 text-foreground" />}
      {theme === "system" && <Monitor className="w-4 h-4 text-foreground" />}
    </button>
  );
}
