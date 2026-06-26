"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAccessibility } from "@/hooks/useAccessibility";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Building,
} from "lucide-react";
import { getIssues } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_COMPLAINTS } from "@/lib/mock-data";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Helper function to format date/time into "time ago" string
function timeAgo(dateStr: string) {
  try {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    if (diffMs < 0) return "Just now";
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch (e) {
    return "";
  }
}

export default function DashboardPage() {
  const { screenReader } = useAccessibility();
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const data = await getIssues();
      const rawList = data && data.length > 0 ? data : MOCK_COMPLAINTS;
      
      // Normalize issue categories and statuses for robust, consistent local calculations
      const normalized = rawList.map((i: any) => {
        const rawStatus = (i.status || "").toUpperCase();
        const rawCategory = (i.category || "").toUpperCase();
        const createdAt = i.created_at || i.createdAt || new Date().toISOString();
        const resolvedAt = i.resolved_at || i.resolvedAt || null;

        let status = "OPEN";
        if (rawStatus === "RESOLVED") {
          status = "RESOLVED";
        } else if (rawStatus === "IN_PROGRESS" || rawStatus === "IN-PROGRESS" || rawStatus === "IN_WORK") {
          status = "IN_PROGRESS";
        } else {
          status = "OPEN";
        }

        let category = "OTHER";
        if (rawCategory === "ROADS" || rawCategory === "POTHOLE" || rawCategory === "DAMAGED_ROAD" || rawCategory === "DAMAGED-ROAD") {
          category = "POTHOLE";
        } else if (rawCategory === "WATER" || rawCategory === "WATER_LEAKAGE" || rawCategory === "WATER-LEAKAGE") {
          category = "WATER_LEAKAGE";
        } else if (rawCategory === "LIGHT" || rawCategory === "BROKEN_LIGHT" || rawCategory === "STREETLIGHT" || rawCategory === "BROKEN-LIGHT") {
          category = "BROKEN_LIGHT";
        } else if (rawCategory === "GARBAGE" || rawCategory === "SANITATION") {
          category = "GARBAGE";
        } else if (rawCategory === "ELECTRICAL") {
          category = "DAMAGED_ROAD";
        }

        return {
          ...i,
          id: i.id,
          description: i.description || i.title || "Civic Issue",
          address: i.address || (i.location && i.location.address) || "Unknown Address",
          city: i.city || (i.location && i.location.city) || "Bangalore",
          imageUrl: i.image_url || i.imageUrl || "",
          status,
          category,
          created_at: createdAt,
          resolved_at: resolvedAt
        };
      });

      setIssues(normalized);
    } catch (e) {
      console.error("Failed to load issues:", e);
      // Fallback with normalized mock data
      const fallbackNormalized = MOCK_COMPLAINTS.map((i: any) => {
        const rawStatus = (i.status || "").toUpperCase();
        const rawCategory = (i.category || "").toUpperCase();
        const createdAt = i.created_at || i.createdAt || new Date().toISOString();
        const resolvedAt = i.resolved_at || i.resolvedAt || null;

        let status = "OPEN";
        if (rawStatus === "RESOLVED") {
          status = "RESOLVED";
        } else if (rawStatus === "IN_PROGRESS" || rawStatus === "IN-PROGRESS" || rawStatus === "IN_WORK") {
          status = "IN_PROGRESS";
        } else {
          status = "OPEN";
        }

        let category = "OTHER";
        if (rawCategory === "ROADS" || rawCategory === "POTHOLE" || rawCategory === "DAMAGED_ROAD" || rawCategory === "DAMAGED-ROAD") {
          category = "POTHOLE";
        } else if (rawCategory === "WATER" || rawCategory === "WATER_LEAKAGE" || rawCategory === "WATER-LEAKAGE") {
          category = "WATER_LEAKAGE";
        } else if (rawCategory === "LIGHT" || rawCategory === "BROKEN_LIGHT" || rawCategory === "STREETLIGHT" || rawCategory === "BROKEN-LIGHT") {
          category = "BROKEN_LIGHT";
        } else if (rawCategory === "GARBAGE" || rawCategory === "SANITATION") {
          category = "GARBAGE";
        } else if (rawCategory === "ELECTRICAL") {
          category = "DAMAGED_ROAD";
        }

        return {
          ...i,
          id: i.id,
          description: i.description || i.title || "Civic Issue",
          address: i.address || (i.location && i.location.address) || "Unknown Address",
          city: i.city || (i.location && i.location.city) || "Bangalore",
          imageUrl: i.image_url || i.imageUrl || "",
          status,
          category,
          created_at: createdAt,
          resolved_at: resolvedAt
        };
      });
      setIssues(fallbackNormalized);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchIssues();
  }, []);

  // 2. Calculate stats from issues array:
  const total = issues.length;
  const resolved = issues.filter(i => i.status === "RESOLVED").length;
  const open = issues.filter(i => i.status === "OPEN").length;
  const inProgress = issues.filter(i => i.status === "IN_PROGRESS").length;

  // 3. Category breakdown for pie chart:
  const categories = ["POTHOLE", "WATER_LEAKAGE", "BROKEN_LIGHT", "GARBAGE", "DAMAGED_ROAD", "OTHER"];
  
  const categoryData = useMemo(() => {
    return categories.map(cat => ({
      name: cat,
      value: issues.filter(i => i.category === cat).length
    })).filter(d => d.value > 0);
  }, [issues]);

  // Map categoryData items to colors and display names for the Recharts cell rendering
  const categoryChartData = useMemo(() => {
    return categoryData.map(item => {
      let displayName = item.name;
      let color = "#71717A";
      if (item.name === "POTHOLE") { displayName = "Pothole"; color = "#EF4444"; }
      else if (item.name === "WATER_LEAKAGE") { displayName = "Water Leakage"; color = "#3B82F6"; }
      else if (item.name === "BROKEN_LIGHT") { displayName = "Streetlight"; color = "#EAB308"; }
      else if (item.name === "GARBAGE") { displayName = "Garbage"; color = "#22C55E"; }
      else if (item.name === "DAMAGED_ROAD") { displayName = "Damaged Road"; color = "#F97316"; }
      
      return {
        ...item,
        displayName,
        color
      };
    });
  }, [categoryData]);

  // 4. Weekly trend for line chart (last 7 days):
  const weeklyTrendData = useMemo(() => {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    return last7Days.map(date => ({
      date: date.slice(5), // MM-DD
      reported: issues.filter(i => i.created_at?.startsWith(date)).length,
      resolved: issues.filter(i => i.resolved_at?.startsWith(date)).length
    }));
  }, [issues]);

  const statusChartData = useMemo(() => {
    return [
      { name: "Open", count: open, color: "#3B82F6" },
      { name: "In Progress", count: inProgress, color: "#EAB308" },
      { name: "Resolved", count: resolved, color: "#22C55E" }
    ];
  }, [open, inProgress, resolved]);

  // 7. Recent activity feed: last 8 issues sorted by created_at
  const recentIssues = useMemo(() => {
    return [...issues]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 8);
  }, [issues]);

  const cityStats = useMemo(() => {
    const cities: Record<string, { reports: number; resolved: number }> = {};
    
    issues.forEach(i => {
      const city = i.city || "Unknown";
      if (!cities[city]) {
        cities[city] = { reports: 0, resolved: 0 };
      }
      cities[city].reports++;
      if (i.status === "RESOLVED") {
        cities[city].resolved++;
      }
    });

    return Object.entries(cities).map(([name, val]) => {
      const resolutionRate = val.reports > 0 ? Math.round((val.resolved / val.reports) * 100) : 0;
      return {
        city: name,
        reports: val.reports,
        resolved: val.resolved,
        resolutionRate
      };
    }).sort((a, b) => b.reports - a.reports);
  }, [issues]);

  const activeCitiesCount = useMemo(() => {
    return new Set(issues.map(i => i.city)).size;
  }, [issues]);

  const categoryColorMap: Record<string, string> = {
    POTHOLE: "#EF4444",
    WATER_LEAKAGE: "#3B82F6",
    BROKEN_LIGHT: "#EAB308",
    GARBAGE: "#22C55E",
    DAMAGED_ROAD: "#F97316",
    OTHER: "#71717A"
  };

  const categoryLabelMap: Record<string, string> = {
    POTHOLE: "Pothole",
    WATER_LEAKAGE: "Water Leakage",
    BROKEN_LIGHT: "Streetlight",
    GARBAGE: "Garbage",
    DAMAGED_ROAD: "Damaged Road",
    OTHER: "Other"
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 
            className="text-3xl font-extrabold tracking-tight text-foreground"
            style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
          >
            Civic Impact
          </h1>
          <p className="text-muted leading-normal max-w-[65ch] text-sm">
            Real-time metrics tracking municipal response efficiency and engagement.
          </p>
        </div>
        <button
          onClick={fetchIssues}
          disabled={isLoading}
          className="h-10 px-4 flex items-center justify-center gap-2 border border-border bg-surface hover:bg-border/20 rounded-md text-xs font-bold transition-all select-none cursor-pointer self-start sm:self-auto disabled:opacity-50"
          aria-label={screenReader ? "Refresh dashboard analytics data" : "Refresh data"}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Refreshing..." : "Refresh Stats"}</span>
        </button>
      </div>

      {/* 6. Add loading skeleton while fetching: Show 4 grey pulsing cards while loading */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-surface/50 border border-border/50 rounded-lg p-6 h-32 animate-pulse flex flex-col justify-between">
              <div className="w-8 h-8 bg-border/40 rounded-full" />
              <div className="space-y-2">
                <div className="h-6 bg-border/40 w-12 rounded" />
                <div className="h-3 bg-border/40 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 5. Update stat cards with real values */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            icon={FileText}
            value={total}
            label="Total Issues Reported"
          />
          <StatCard
            icon={AlertTriangle}
            value={open}
            label="Open Issues"
            color="rgba(59, 130, 246, 0.1)"
          />
          <StatCard
            icon={Clock}
            value={inProgress}
            label="In Progress"
            color="rgba(234, 179, 8, 0.1)"
          />
          <StatCard
            icon={CheckCircle2}
            value={resolved}
            label="Resolved Reports"
            color="rgba(34, 197, 94, 0.1)"
          />
        </div>
      )}

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Weekly Trend Line Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 
              className="text-lg font-bold tracking-tight text-foreground"
              style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
            >
              Weekly Trend
            </h3>
            <p className="text-xs text-muted mt-1">Daily count of grievances submitted and resolved across the network over the last 7 days.</p>
          </div>

          <div className="h-[300px] w-full relative">
            {isMounted && !isLoading ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--color-muted)" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="var(--color-muted)" 
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "var(--color-surface)", 
                      borderColor: "var(--color-border)",
                      color: "var(--color-foreground)",
                      borderRadius: "6px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reported" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Reported"
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#22C55E" 
                    strokeWidth={3}
                    name="Resolved"
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-border/20 animate-pulse rounded" />
            )}
          </div>
        </div>

        {/* Right Column: Category Distribution Pie Chart */}
        <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 
              className="text-lg font-bold tracking-tight text-foreground"
              style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
            >
              Category Breakdown
            </h3>
            <p className="text-xs text-muted mt-1">Distribution of anomalies registered by department category.</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-[180px] h-[180px] flex-shrink-0 relative flex justify-center items-center">
              {isMounted && !isLoading ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "var(--color-surface)", 
                        borderColor: "var(--color-border)",
                        color: "var(--color-foreground)",
                        borderRadius: "6px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-[180px] h-[180px] rounded-full border-4 border-border/20 animate-pulse" />
              )}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-foreground">{total}</span>
                <span className="text-[10px] uppercase font-bold text-muted">Issues</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {categoryChartData.map((item) => {
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-foreground">{item.displayName}</span>
                    </div>
                    <span className="font-mono text-muted font-bold">
                      {item.value} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Lifecycle Bar Chart & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Lifecycle status bar chart */}
        <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 
              className="text-lg font-bold tracking-tight text-foreground"
              style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
            >
              Lifecycle Breakdown
            </h3>
            <p className="text-xs text-muted mt-1">Status logs comparison inside the municipal workflow.</p>
          </div>

          <div className="h-[250px] w-full relative">
            {isMounted && !isLoading ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-muted)" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="var(--color-muted)" 
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "var(--color-surface)", 
                      borderColor: "var(--color-border)",
                      color: "var(--color-foreground)",
                      borderRadius: "6px"
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-border/20 animate-pulse rounded" />
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Feed (Takes 2/3 width) */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 
              className="text-lg font-bold tracking-tight text-foreground"
              style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
            >
              Recent Civic Activity
            </h3>
            <p className="text-xs text-muted mt-1">Real-time log of the latest complaints reported by citizens.</p>
          </div>

          <div className="divide-y divide-border/40 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-4 items-center py-3 animate-pulse">
                    <div className="w-3 h-3 bg-border/40 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-border/40 w-1/3 rounded" />
                      <div className="h-3 bg-border/40 w-2/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentIssues.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted">
                No recent activity logged.
              </div>
            ) : (
              /* 7. Recent activity feed: category dot + address + time ago */
              recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between py-3 group hover:bg-border/5 px-2 rounded transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: categoryColorMap[issue.category] || "#71717A" }} 
                      title={categoryLabelMap[issue.category] || "Other"}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {issue.description.split("\n\n")[0]}
                      </h4>
                      <p className="text-[10px] text-muted truncate">
                        {issue.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] text-muted/80 font-mono">
                      {timeAgo(issue.created_at)}
                    </span>
                    <Link
                      href={`/report/${issue.id}`}
                      className="text-xs text-muted hover:text-primary flex items-center justify-center p-1.5 rounded-sm border border-border hover:bg-primary/5 transition-all select-none cursor-pointer"
                      aria-label="View full details and pipeline logs for this complaint"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* City Statistics Table */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 
              className="text-lg font-bold tracking-tight text-foreground"
              style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
            >
              Active Urban Centers
            </h3>
            <p className="text-xs text-muted mt-1">Comparative log of issues resolved by municipality.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-semibold self-start sm:self-auto select-none">
            <Building className="w-3.5 h-3.5" />
            <span>Active cities: {activeCitiesCount}</span>
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
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-border/40 w-24 rounded" /></td>
                    <td className="p-4"><div className="h-4 bg-border/40 w-12 rounded" /></td>
                    <td className="p-4"><div className="h-4 bg-border/40 w-12 rounded" /></td>
                    <td className="p-4 text-right"><div className="h-4 bg-border/40 w-16 ml-auto rounded" /></td>
                  </tr>
                ))
              ) : cityStats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-xs text-muted">
                    No active urban centers registered.
                  </td>
                </tr>
              ) : (
                cityStats.map((city) => (
                  <tr key={city.city} className="hover:bg-border/10 transition-colors">
                    <td className="p-4 font-bold text-foreground">{city.city}</td>
                    <td className="p-4 font-mono text-muted">{city.reports.toLocaleString("en-IN")}</td>
                    <td className="p-4 font-mono text-muted">{city.resolved.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-right font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          city.resolutionRate >= 75
                            ? "bg-success/10 text-success"
                            : city.resolutionRate >= 50
                            ? "bg-warning/10 text-warning"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {city.resolutionRate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
