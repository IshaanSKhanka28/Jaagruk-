"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Map, BarChart3, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const MOBILE_TABS = [
  { href: "/report", label: "Report", icon: Camera },
  { href: "/map", label: "Map", icon: Map },
  { href: "/dashboard", label: "Stats", icon: BarChart3 },
  { href: "/leaderboard", label: "Heroes", icon: Trophy },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/80 bg-surface/85 backdrop-blur-md safe-area-pb"
      style={{ zIndex: "var(--z-sticky)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      id="mobile-nav"
    >
      <div className="grid grid-cols-4 h-16">
        {MOBILE_TABS.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href + "/"));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors ${
                isActive ? "text-primary" : "text-muted hover:text-foreground"
              }`}
              style={{ transitionDuration: "var(--duration-fast)" }}
              id={`mobile-tab-${tab.label.toLowerCase()}`}
            >
              <div className="relative w-10 h-7 flex items-center justify-center">
                {isActive && (
                  <motion.span
                    layoutId="mobile-active-tab-pill"
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? "text-primary" : "text-muted"}`} />
              </div>
              <span className="relative z-10">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
