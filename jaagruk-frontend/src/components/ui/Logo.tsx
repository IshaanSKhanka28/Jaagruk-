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

export function AppIcon({ size = 36, theme }: AppIconProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const clipId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme || (mounted ? resolvedTheme : "light") || "light";
  const eyeColor = currentTheme === "dark" ? "#FFFFFF" : "#1D4ED8";
  const irisColor = currentTheme === "dark" ? "#3B82F6" : "#1D4ED8";

  // Aspect ratio is 110 / 44 = 2.5
  // If height = size, width = size * 2.5
  const height = size;
  const width = size * 2.5;

  return (
    <svg
      width={width}
      height={height}
      viewBox="45 3 110 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="100" cy="25" r="7" />
        </clipPath>
      </defs>

      {/* Eye lens outline shape (stroke-width 2.5px) */}
      <path
        d="M 50,25 C 80,5 120,5 150,25 C 120,45 80,45 50,25 Z"
        stroke={eyeColor}
        strokeWidth="2.5"
        fill="none"
      />

      {/* Outer iris ring (visible blue in dark mode) */}
      <circle cx="100" cy="25" r="14" stroke={irisColor} strokeWidth="1.5" fill="none" />

      {/* Inner iris ring (visible blue in dark mode) */}
      <circle cx="100" cy="25" r="10" stroke={irisColor} strokeWidth="1" fill="none" />

      {/* Pupil with city skyline inside */}
      <g clipPath={`url(#${clipId})`}>
        <circle cx="100" cy="25" r="7" fill="#1D4ED8" />
        {/* City skyline bars */}
        <rect x="89" y="24" width="2" height="8" fill="white" />
        <rect x="94" y="20" width="2" height="12" fill="white" />
        <rect x="99" y="22" width="2" height="10" fill="white" />
        <rect x="104" y="18" width="2" height="14" fill="white" />
        <rect x="109" y="23" width="2" height="9" fill="white" />
      </g>

      {/* Alert orange dot on the top-right lens tip (r=5 gives >=8px diameter in output) */}
      <circle cx="146" cy="21" r="5" fill="#F97316" stroke="white" strokeWidth="1.2" />
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

export function LogoHorizontal({ theme, size = 36 }: LogoHorizontalProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (theme || (mounted ? resolvedTheme : "light") || "light") as "light" | "dark";
  const textColor = currentTheme === "dark" ? "text-white" : "text-[#1D4ED8]";

  return (
    <div className="flex items-center gap-[10px] select-none pl-2" style={{ height: size }}>
      <AppIcon size={size} theme={currentTheme} />
      <span
        className={`font-sans font-extrabold tracking-tight ${textColor}`}
        style={{
          fontSize: "22px",
          fontWeight: 800,
          letterSpacing: "-0.05em",
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
