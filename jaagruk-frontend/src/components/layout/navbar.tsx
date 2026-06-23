"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogoHorizontal } from "@/components/ui/Logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 border-b border-border bg-background/80 backdrop-blur-md"
      style={{ zIndex: "var(--z-sticky)" }}
      id="navbar"
    >
      <div className="mx-auto max-w-[1120px] px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" id="logo" className="hover:opacity-90 transition-opacity">
          <LogoHorizontal size={36} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" id="desktop-nav">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-[var(--radius-md)] transition-colors z-10 ${
                  isActive
                    ? "text-primary"
                    : "text-muted hover:text-foreground hover:bg-surface/50"
                }`}
                style={{ transitionDuration: "var(--duration-fast)" }}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-[var(--radius-md)] z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/report"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
            style={{ transitionDuration: "var(--duration-fast)" }}
            id="report-cta"
          >
            Report Issue
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] border border-border hover:bg-surface transition-colors"
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2.5 text-sm font-medium rounded-[var(--radius-md)] transition-colors ${
                      isActive
                        ? "text-primary bg-primary-subtle"
                        : "text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/report"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-[var(--radius-md)] bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                Report Issue
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
