import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-border bg-background" id="footer">
      <div className="mx-auto max-w-[1120px] px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-primary flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Jaagruk</span>
              <p className="text-xs text-muted">See it. Report it. Fix it.</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-muted">
            <Link href="/map" className="hover:text-foreground transition-colors">Map</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Jaagruk. Built for India.
          </p>
        </div>
      </div>
    </footer>
  );
}
