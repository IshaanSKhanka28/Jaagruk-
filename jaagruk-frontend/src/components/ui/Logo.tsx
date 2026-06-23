"use client";

import React, { useId, useEffect, useState } from "react";
import { useTheme } from "next-themes";

// =============================================
// 1. AppIcon Component (Eye icon mark only)
// =============================================
interface AppIconProps {
  size?: number;
  theme?: "light" | "dark";
}

export function AppIcon({ size = 28, theme }: AppIconProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const clipId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme || (mounted ? resolvedTheme : "light") || "light";
  const eyeColor = currentTheme === "dark" ? "#FFFFFF" : "#1D4ED8";
  const irisColor = "#3B82F6"; // Lighter blue for high visibility
  const pupilColor = "#1E3A8A";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="14" cy="14" r="4.5" />
        </clipPath>
      </defs>

      {/* Eye lens outline shape (stroke-width: 2px) */}
      <path
        d="M 2,14 C 6,4 22,4 26,14 C 22,24 6,24 2,14 Z"
        stroke={eyeColor}
        strokeWidth="2"
        fill="none"
      />

      {/* Outer iris ring */}
      <circle cx="14" cy="14" r="7.5" stroke={irisColor} strokeWidth="1" fill="none" />

      {/* Inner iris ring */}
      <circle cx="14" cy="14" r="5.5" stroke={irisColor} strokeWidth="0.8" fill="none" />

      {/* Pupil with city skyline inside (fill: #1E3A8A) */}
      <g clipPath={`url(#${clipId})`}>
        <circle cx="14" cy="14" r="4.5" fill={pupilColor} />
        {/* City skyline bars - white, clearly visible */}
        <rect x="10.5" y="13" width="1" height="6" fill="white" />
        <rect x="12" y="11" width="1" height="8" fill="white" />
        <rect x="13.5" y="12" width="1" height="7" fill="white" />
        <rect x="15" y="10" width="1" height="9" fill="white" />
        <rect x="16.5" y="13" width="1" height="6" fill="white" />
      </g>

      {/* Alert orange dot on the top-right lens tip (8px diameter => r=4) */}
      <circle cx="24" cy="9" r="4" fill="#F97316" />
    </svg>
  );
}

// =============================================
// 2. LogoLight Component (Light lockup)
// =============================================
interface LogoLockupProps {
  size?: "sm" | "md" | "lg";
}

export function LogoLight({ size = "md" }: LogoLockupProps) {
  const iconSize = size === "sm" ? 32 : size === "md" ? 48 : 64;
  const titleSize = size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-4xl";
  const taglineSize = size === "sm" ? "text-[9px]" : size === "md" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <AppIcon size={iconSize} theme="light" />
      <div className="space-y-1">
        <h2 
          className={`font-sans font-extrabold tracking-tight text-[#1D4ED8] ${titleSize}`} 
          style={{ letterSpacing: "-0.05em", lineHeight: 1 }}
        >
          Jaagruk
        </h2>
        <p className={`font-mono font-bold tracking-widest text-[#64748B] uppercase ${taglineSize}`}>
          SEE IT. REPORT IT. FIX IT.
        </p>
      </div>
    </div>
  );
}

// =============================================
// 3. LogoDark Component (Dark lockup)
// =============================================
export function LogoDark({ size = "md" }: LogoLockupProps) {
  const iconSize = size === "sm" ? 32 : size === "md" ? 48 : 64;
  const titleSize = size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-4xl";
  const taglineSize = size === "sm" ? "text-[9px]" : size === "md" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <AppIcon size={iconSize} theme="dark" />
      <div className="space-y-1">
        <h2 
          className={`font-sans font-extrabold tracking-tight text-white ${titleSize}`} 
          style={{ letterSpacing: "-0.05em", lineHeight: 1 }}
        >
          Jaagruk
        </h2>
        <p className={`font-mono font-bold tracking-widest text-[#F97316] uppercase ${taglineSize}`}>
          SEE IT. REPORT IT. FIX IT.
        </p>
      </div>
    </div>
  );
}

// =============================================
// 4. LogoHorizontal Component (Navbar version)
// =============================================
interface LogoHorizontalProps {
  theme?: "light" | "dark";
  size?: number;
}

export function LogoHorizontal({ theme, size = 28 }: LogoHorizontalProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (theme || (mounted ? resolvedTheme : "light") || "light") as "light" | "dark";
  const isDark = currentTheme === "dark";

  // Frosted glass pill style containers conforming to design specs
  const bgStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(29, 78, 216, 0.06)";
  const borderStyle = isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(29, 78, 216, 0.12)";
  const textColor = isDark ? "text-white" : "text-[#1D4ED8]";

  return (
    <div 
      className={`flex items-center gap-[10px] select-none transition-all ${textColor}`}
      style={{ 
        background: bgStyle,
        border: borderStyle,
        borderRadius: "10px",
        padding: "6px 12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)"
      }}
    >
      <AppIcon size={28} theme={currentTheme} />
      <span
        className="font-sans font-extrabold tracking-tight"
        style={{
          fontSize: "18px",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          lineHeight: 1,
        }}
      >
        Jaagruk
      </span>
    </div>
  );
}

// =============================================
// 5. Logo Component (Theme-responsive vertical lockup)
// =============================================
export function Logo({ size = "md" }: LogoLockupProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = ((mounted ? resolvedTheme : "light") || "light") as "light" | "dark";
  const titleColor = currentTheme === "dark" ? "text-white" : "text-[#1D4ED8]";
  const taglineColor = currentTheme === "dark" ? "text-[#F97316]" : "text-[#64748B]";

  const iconSize = size === "sm" ? 32 : size === "md" ? 48 : 64;
  const titleSize = size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-4xl";
  const taglineSize = size === "sm" ? "text-[9px]" : size === "md" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <AppIcon size={iconSize} theme={currentTheme} />
      <div className="space-y-1">
        <h2 
          className={`font-sans font-extrabold tracking-tight ${titleColor} ${titleSize}`} 
          style={{ letterSpacing: "-0.05em", lineHeight: 1 }}
        >
          Jaagruk
        </h2>
        <p className={`font-mono font-bold tracking-widest uppercase ${taglineColor} ${taglineSize}`}>
          SEE IT. REPORT IT. FIX IT.
        </p>
      </div>
    </div>
  );
}

