"use client";

import Link from "next/link";
import { User, ArrowLeft, FileText, Award, TrendingUp } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm">
        {/* Identity */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Anonymous Citizen</h1>
            <p className="text-sm text-muted">Reporting civic issues across your city</p>
          </div>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FileText, label: "Reports", value: "0" },
            { icon: Award, label: "Badges", value: "0" },
            { icon: TrendingUp, label: "Impact", value: "0" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 p-4 rounded-md border border-border bg-background"
              >
                <Icon className="w-5 h-5 text-primary mb-1" />
                <span className="text-xl font-bold text-foreground">{stat.value}</span>
                <span className="text-[11px] text-muted">{stat.label}</span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted mt-8 leading-relaxed">
          Profile accounts are coming soon. For now, reports are filed anonymously and tracked by
          your device.
        </p>
      </div>
    </div>
  );
}
