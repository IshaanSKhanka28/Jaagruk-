"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Search,
  MapPin,
  ArrowRight,
  Compass,
  AlertCircle,
} from "lucide-react";
import { MOCK_COMPLAINTS, CATEGORY_META, Complaint, ComplaintCategory, ComplaintStatus } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { getIssues } from "@/lib/api";

const Map = dynamic(() => import("./Map"), { ssr: false });

function mapBackendCategory(category: string): ComplaintCategory {
  const c = (category || "").toLowerCase().replace(/_/g, "-");
  if (c === "damaged-road") return "pothole";
  if (c === "broken-light") return "streetlight";
  if (c === "pothole" || c === "water-leakage" || c === "streetlight" || c === "garbage" || c === "electrical" || c === "drainage" || c === "other") {
    return c;
  }
  return "other";
}

function mapBackendStatus(status: string): ComplaintStatus {
  const s = (status || "").toLowerCase().replace(/_/g, "-");
  if (s === "open" || s === "submitted") return "submitted";
  if (s === "in-progress") return "in-progress";
  if (s === "resolved") return "resolved";
  if (s === "rejected") return "rejected";
  return "submitted";
}

export default function MapPage() {
  const { screenReader } = useAccessibility();
  const { t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      const allIssues = await getIssues();
      setIssues(allIssues || []);
      setIsLoading(false);
    } catch (e) {
      console.error("Failed to fetch issues in map page:", e);
      setIsLoading(false);
    }
  };

  // Poll issues every 30 seconds
  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format backend issues to match Complaint type
  const formattedComplaints = useMemo(() => {
    return issues.map((issue) => {
      const cat = mapBackendCategory(issue.category);
      const stat = mapBackendStatus(issue.status);
      let title = "Civic Grievance";
      let desc = issue.description || "";
      if (desc.includes("\n\n")) {
        title = desc.split("\n\n")[0];
        desc = desc.split("\n\n").slice(1).join("\n\n");
      } else if (desc.length > 50) {
        title = desc.substring(0, 47) + "...";
      } else if (desc.length > 0) {
        title = desc;
      }
      
      return {
        id: String(issue.id),
        title,
        description: desc,
        category: cat,
        status: stat,
        location: {
          address: issue.address || "Unknown Address",
          city: "Bangalore",
          lat: issue.lat,
          lng: issue.lng
        },
        imageUrl: issue.image_url,
        upvotes: issue.upvotes || 0,
        severity: issue.severity || 1,
        priority: issue.priority || "LOW",
        department: issue.department || "",
        agentLog: issue.agent_log
      };
    });
  }, [issues]);

  const cityCenters: Record<string, [number, number]> = {
    Bangalore: [12.9716, 77.5946],
    Mumbai: [19.0760, 72.8777],
    Delhi: [28.6139, 77.2090]
  };

  // Filter complaints dynamically
  const filteredComplaints = useMemo(() => {
    return formattedComplaints.filter((c) => {
      if (c.location.lat == null || c.location.lng == null) return false;

      const centerCoord = cityCenters[selectedCity];
      let matchesCity = false;
      if (centerCoord) {
        const dist = Math.sqrt(Math.pow(c.location.lat - centerCoord[0], 2) + Math.pow(c.location.lng - centerCoord[1], 2));
        matchesCity = dist < 0.6;
      }
      if (!matchesCity && c.location.address) {
        matchesCity = c.location.address.toLowerCase().includes(selectedCity.toLowerCase());
      }

      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;

      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.address.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCity && matchesCategory && matchesSearch;
    });
  }, [formattedComplaints, selectedCity, selectedCategory, searchQuery]);

  // Fallback to static mock complaints if database is empty
  const displayComplaints = useMemo(() => {
    if (filteredComplaints.length > 0) return filteredComplaints;
    
    // Return empty list during initial load, else return filtered mock complaints
    if (isLoading && issues.length === 0) return [];
    
    return MOCK_COMPLAINTS.filter((c) => {
      const matchesCity = c.location.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesCategory && matchesSearch;
    });
  }, [filteredComplaints, isLoading, issues, selectedCity, selectedCategory, searchQuery]);

  // Set default selected complaint if none active
  useEffect(() => {
    if (displayComplaints.length > 0 && !selectedComplaint) {
      setSelectedComplaint(displayComplaints[0]);
    }
  }, [displayComplaints, selectedComplaint]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Sidebar: Filter Panel & Complaint List */}
      <div className="w-full lg:w-[400px] border-r border-border bg-surface flex flex-col h-full relative z-10">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">{t("civicRadar")}</h1>
            
            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedComplaint(null);
              }}
              className="text-xs font-semibold px-3 h-12 border border-border bg-background rounded-sm focus:outline-none cursor-pointer"
              aria-label={screenReader ? "Select active city for radar scanning" : "Select city"}
              role="combobox"
            >
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reports or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-9 pr-4 rounded-sm border border-border bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground"
              aria-label={screenReader ? "Search reports by category name or location coordinates" : "Search map"}
              role="searchbox"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 h-12 flex items-center justify-center rounded-full text-xs font-bold whitespace-nowrap transition-colors border select-none cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-border hover:bg-border/20 text-muted hover:text-foreground"
              }`}
              aria-label={screenReader ? "Show all category anomalies" : "All anomalies"}
              role="tab"
              aria-selected={selectedCategory === "all"}
            >
              All Anomaly
            </button>
            {Object.entries(CATEGORY_META).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 h-12 flex items-center justify-center rounded-full text-xs font-bold whitespace-nowrap transition-colors border select-none cursor-pointer ${
                  selectedCategory === key
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border hover:bg-border/20 text-muted hover:text-foreground"
                }`}
                aria-label={screenReader ? `Filter by ${value.label} category` : value.label}
                role="tab"
                aria-selected={selectedCategory === key}
              >
                <span className="mr-1.5 text-sm">{value.icon}</span> {value.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints List Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {selectedComplaint ? (
            <div className="p-5 space-y-6">
              {/* Back Button */}
              <button
                onClick={() => setSelectedComplaint(null)}
                className="h-10 px-4 flex items-center justify-center gap-2 border border-border hover:bg-border/20 rounded-md text-xs font-bold transition-colors select-none cursor-pointer text-muted hover:text-foreground w-full"
                aria-label="Back to complaints list"
              >
                <span>← Back to List</span>
              </button>

              {/* Image */}
              {selectedComplaint.imageUrl && (
                <div className="w-full h-44 rounded-md overflow-hidden border border-border bg-background select-none">
                  <img
                    src={selectedComplaint.imageUrl}
                    alt={selectedComplaint.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  {CATEGORY_META[selectedComplaint.category as ComplaintCategory]?.label || selectedComplaint.category}
                </span>
                <StatusBadge status={selectedComplaint.status as ComplaintStatus} size="sm" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-base text-foreground leading-tight">
                  {selectedComplaint.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap max-h-[120px] overflow-y-auto pr-1">
                  {selectedComplaint.description || "No description provided."}
                </p>
              </div>

              {/* Severity Level */}
              <div className="space-y-1.5 border-t border-border/40 pt-4">
                <div className="text-[10px] uppercase font-bold text-muted">{t("severityLevel")}</div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <span
                      key={dot}
                      className={`w-3 h-3 rounded-full border ${
                        dot <= (selectedComplaint.severity || 1)
                          ? "bg-error border-error"
                          : "bg-transparent border-muted/30"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-muted font-mono ml-2">
                    {selectedComplaint.severity || 1}/5
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border/40 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted font-mono">
                  <span>ID: {selectedComplaint.id}</span>
                </div>
                <Link
                  href={`/report/${selectedComplaint.id}`}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-bold transition-all select-none cursor-pointer"
                  aria-label="Track agent pipeline details"
                >
                  <span>{t("trackAgentPipeline")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : displayComplaints.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-muted mx-auto animate-pulse" />
              <div className="text-sm font-semibold text-muted">{t("noReportsFound")}</div>
              <div className="text-xs text-muted/80">{t("adjustFilters")}</div>
            </div>
          ) : (
            displayComplaints.map((c) => {
              const meta = CATEGORY_META[c.category as ComplaintCategory];
              const isSelected = selectedComplaint?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-4 cursor-pointer hover:bg-border/10 transition-colors ${
                    isSelected ? "bg-primary-subtle border-l-2 border-primary" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details of ${c.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedComplaint(c);
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-base">{meta?.icon}</span> {meta?.label}
                    </span>
                    <StatusBadge status={c.status as ComplaintStatus} size="sm" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground truncate mb-1">{c.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted font-mono">
                    <span>{c.id}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {c.location.address.split(",")[0]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Leaflet Map */}
      <div className="flex-1 bg-background relative flex flex-col">
        {/* Map Header Status Controls */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <div className="bg-surface/90 border border-border backdrop-blur-md px-3 h-12 rounded-md flex items-center gap-2 text-xs font-semibold shadow-sm select-none">
            <Compass className="w-3.5 h-3.5 text-primary animate-spin" style={{ animationDuration: "12s" }} />
            <span>{t("scannerActive")}</span>
          </div>
        </div>

        {/* Dynamic Leaflet Map */}
        <div className="flex-1 w-full relative overflow-hidden z-0">
          <Map
            issues={displayComplaints}
            selectedCity={selectedCity}
            selectedComplaint={selectedComplaint}
            setSelectedComplaint={setSelectedComplaint}
          />
        </div>
      </div>
    </div>
  );
}
