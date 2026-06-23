"use client";

import React, { useId, useEffect, useState } from "react";
import { useTheme } from "next-themes";

// =============================================
// 1. AppIcon Component (Eye icon mark only)
// =============================================
interface AppIconProps {
  size?: number;
}

export function AppIcon({ size = 40 }: AppIconProps) {
  const clipId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="40 -35 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="100" cy="25" r="7" />
        </clipPath>
      </defs>

      {/* Navy Blue lens shape */}
      <path
        d="M 50,25 C 80,5 120,5 150,25 C 120,45 80,45 50,25 Z"
        fill="#1D4ED8"
      />

      {/* White outer iris ring */}
      <circle cx="100" cy="25" r="14" stroke="white" strokeWidth="1.5" fill="none" />

      {/* White inner iris ring */}
      <circle cx="100" cy="25" r="10" stroke="white" strokeWidth="1" fill="none" />

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

      {/* Alert orange dot on the top-right lens tip */}
      <circle cx="146" cy="21" r="6" fill="#F97316" stroke="white" strokeWidth="1.5" />
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
  const iconSize = size === "sm" ? 48 : size === "md" ? 64 : 96;
  const titleSize = size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-4xl";
  const taglineSize = size === "sm" ? "text-[9px]" : size === "md" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <AppIcon size={iconSize} />
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
  const iconSize = size === "sm" ? 48 : size === "md" ? 64 : 96;
  const titleSize = size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-4xl";
  const taglineSize = size === "sm" ? "text-[9px]" : size === "md" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <AppIcon size={iconSize} />
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

  const currentTheme = theme || (mounted ? resolvedTheme : "light") || "light";
  const textColor = currentTheme === "dark" ? "text-white" : "text-[#1D4ED8]";

  return (
    <div className="flex items-center gap-2 select-none" style={{ height: size }}>
      <AppIcon size={size} />
      <span
        className={`font-sans font-extrabold tracking-tight ${textColor}`}
        style={{
          fontSize: `${size * 0.55}px`,
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
