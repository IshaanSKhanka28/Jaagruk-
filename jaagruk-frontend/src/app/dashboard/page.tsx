"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/hooks/useAccessibility";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Building,
  Activity,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_CATEGORY_DISTRIBUTION,
  MOCK_STATUS_DISTRIBUTION,
  MOCK_CITY_STATS,
} from "@/lib/mock-data";
import { StatCard } from "@/components/ui/stat-card";

export default function DashboardPage() {
  const { screenReader } = useAccessibility();

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 
          className="text-3xl font-extrabold tracking-tight text-foreground"
          style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
        >
          Civic Impact
        </h1>
        <p className="text-muted leading-normal max-w-[65ch]">
          Real-time metrics tracking municipal response efficiency and engagement.
        </p>
      </div>

      {/* Grid: 4 Core Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          value={MOCK_DASHBOARD_STATS.totalReports}
          label="Total Issues Reported"
        />
        <StatCard
          icon={CheckCircle2}
          value={MOCK_DASHBOARD_STATS.resolved}
          label="Resolved Reports"
        />
        <StatCard
          icon={Clock}
          value={MOCK_DASHBOARD_STATS.avgResolutionHours}
          label="Avg Resolution Time"
          suffix="h"
        />
        <StatCard
          icon={Users}
          value={MOCK_DASHBOARD_STATS.citizensEngaged}
          label="Citizens Engaged"
        />
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Category Distribution */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h3 
              className="text-lg font-bold tracking-tight"
              style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
            >
              Category Distribution
            </h3>
            <p className="text-xs text-muted mt-1">Breakdown of reported issues by civic classification.</p>
          </div>

          <div className="space-y-4">
            {MOCK_CATEGORY_DISTRIBUTION.map((item, idx) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{item.category}</span>
                  <span className="font-mono text-muted">
                    {item.count.toLocaleString("en-IN")} ({item.percentage}%)
                  </span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="h-2.5 w-full bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                    className="h-full bg-primary rounded-full"
                    style={{ willChange: "width" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Status Summary */}
        <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 
              className="text-lg font-bold tracking-tight"
              style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
            >
              Lifecycle Breakdown
            </h3>
            <p className="text-xs text-muted mt-1">Status of all complaints registered within the network.</p>
          </div>

          {/* Donut Chart representation via SVG */}
          <div className="flex justify-center items-center py-4 relative">
            <svg width="180" height="180" viewBox="0 0 36 36" className="transform -rotate-90">
              {/* Outer track */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-border)" strokeWidth="3" />
              
              {/* Overlay sectors based on distribution percentages */}
              {/* Resolved: 72% */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="3.2"
                strokeDasharray="72 28"
                strokeDashoffset="0"
              />
              {/* In Progress: 17% (offset 72) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="var(--color-warning)"
                strokeWidth="3.2"
                strokeDasharray="17 83"
                strokeDashoffset="-72"
              />
              {/* Submitted: 8% (offset 72+17=89) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="var(--color-info)"
                strokeWidth="3.2"
                strokeDasharray="8 92"
                strokeDashoffset="-89"
              />
              {/* Rejected: 3% (offset 72+17+8=97) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="var(--color-status-rejected)"
                strokeWidth="3.2"
                strokeDasharray="3 97"
                strokeDashoffset="-97"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-foreground">72%</span>
              <span className="text-[10px] uppercase font-bold text-muted">Resolved</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {MOCK_STATUS_DISTRIBUTION.map((item) => (
              <div key={item.status} className="flex items-center gap-2 border border-border/40 p-2 rounded-sm bg-background/50">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <div className="font-semibold text-foreground">{item.status}</div>
                  <div className="font-mono text-muted text-[10px]">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* City Statistics */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 
              className="text-lg font-bold tracking-tight"
              style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
            >
              Active Urban Centers
            </h3>
            <p className="text-xs text-muted mt-1">Comparative log of issues resolved by municipality.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-semibold self-start sm:self-auto">
            <Building className="w-3.5 h-3.5" />
            <span>Active cities: {MOCK_DASHBOARD_STATS.citiesActive}</span>
          </div>
        </div>

        {/* City Stats Table */}
        <div className="overflow-x-auto border border-border/60 rounded-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-background/80 text-muted font-semibold">
                <th className="p-4">City</th>
                <th className="p-4">Reported</th>
                <th className="p-4">Resolved</th>
                <th className="p-4 text-right">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-background/30">
              {MOCK_CITY_STATS.map((city) => (
                <tr key={city.city} className="hover:bg-border/10 transition-colors">
                  <td className="p-4 font-bold text-foreground">{city.city}</td>
                  <td className="p-4 font-mono text-muted">{city.reports.toLocaleString("en-IN")}</td>
                  <td className="p-4 font-mono text-muted">{city.resolved.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-right font-mono">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        city.resolutionRate >= 75
                          ? "bg-success/10 text-success"
                          : city.resolutionRate >= 65
                          ? "bg-warning/10 text-warning"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {city.resolutionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
