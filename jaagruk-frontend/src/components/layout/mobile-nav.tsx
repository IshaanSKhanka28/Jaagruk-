"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Map, BarChart3, Trophy } from "lucide-react";

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
      className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur-md safe-area-pb"
      style={{ zIndex: "var(--z-sticky)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      id="mobile-nav"
    >
      <div className="grid grid-cols-4 h-16">
        {MOBILE_TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted"
              }`}
              style={{ transitionDuration: "var(--duration-fast)" }}
              id={`mobile-tab-${tab.label.toLowerCase()}`}
            >
              <div
                className={`w-10 h-7 flex items-center justify-center rounded-full transition-colors ${
                  isActive ? "bg-primary-subtle" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
