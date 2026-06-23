"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/hooks/useAccessibility";
import {
  Search,
  Filter,
  MapPin,
  ArrowRight,
  Compass,
  Layers,
  AlertCircle,
} from "lucide-react";
import { MOCK_COMPLAINTS, CATEGORY_META, Complaint } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";

export default function MapPage() {
  const { screenReader } = useAccessibility();
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(MOCK_COMPLAINTS[0]);

  // Map settings
  const [mapType, setMapType] = useState<"vector" | "satellite">("vector");

  // Filter complaints based on city, category, and search query
  const filteredComplaints = useMemo(() => {
    return MOCK_COMPLAINTS.filter((c) => {
      const matchesCity = c.location.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesCategory && matchesSearch;
    });
  }, [selectedCity, selectedCategory, searchQuery]);

  // Standardize positions for map visualization (scaled coordinates inside a bounding box)
  const mappedPoints = useMemo(() => {
    if (filteredComplaints.length === 0) return [];
    
    // Find bounds
    const lats = filteredComplaints.map((c) => c.location.lat);
    const lngs = filteredComplaints.map((c) => c.location.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    return filteredComplaints.map((c) => {
      // Map coordinates to percentage coordinates (between 15% and 85% to keep away from edges)
      const y = 85 - ((c.location.lat - minLat) / latRange) * 70; // invert latitude for screen y
      const x = 15 + ((c.location.lng - minLng) / lngRange) * 70;
      return {
        ...c,
        mapX: x,
        mapY: y,
      };
    });
  }, [filteredComplaints]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Sidebar: Filter Panel & Complaint List */}
      <div className="w-full lg:w-[400px] border-r border-border bg-surface flex flex-col h-full relative z-10">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Civic Radar</h1>
            
            {/* City Selector (Touch Target: 48px height) */}
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
            </select>
          </div>

          {/* Search bar (Touch Target: 48px height) */}
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

          {/* Category Filter Pills (Touch Target: 48px height touch points) */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 h-12 flex items-center justify-center rounded-full text-xs font-bold whitespace-nowrap transition-colors border select-none ${
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
                className={`px-4 h-12 flex items-center justify-center rounded-full text-xs font-bold whitespace-nowrap transition-colors border select-none ${
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
          {filteredComplaints.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-muted mx-auto animate-pulse" />
              <div className="text-sm font-semibold text-muted">No reports found</div>
              <div className="text-xs text-muted/80">Try adjusting your filters or search terms.</div>
            </div>
          ) : (
            filteredComplaints.map((c) => {
              const meta = CATEGORY_META[c.category];
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
                    <StatusBadge status={c.status} size="sm" />
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

      {/* Right Area: Interactive Simulated Vector Map */}
      <div className="flex-1 bg-background relative flex flex-col">
        {/* Map Header Status Controls */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <div className="bg-surface/90 border border-border backdrop-blur-md px-3 h-12 rounded-md flex items-center gap-2 text-xs font-semibold shadow-sm select-none">
            <Compass className="w-3.5 h-3.5 text-primary animate-spin" style={{ animationDuration: "12s" }} />
            <span>Civic-Scanner active</span>
          </div>
          <button
            onClick={() => setMapType((prev) => (prev === "vector" ? "satellite" : "vector"))}
            className="bg-surface/90 border border-border backdrop-blur-md px-4 h-12 rounded-md flex items-center gap-2 text-xs font-semibold shadow-sm hover:bg-border/20 transition-colors"
            aria-label={screenReader ? "Toggle visual map style between satellite and vector layout" : "Change map style"}
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Map style: {mapType}</span>
          </button>
        </div>

        {/* Map Grid Rendering */}
        <div
          className="flex-1 w-full relative overflow-hidden flex items-center justify-center select-none"
          style={{
            backgroundColor: mapType === "vector" ? "var(--color-bg)" : "oklch(0.080 0.000 0)",
            backgroundImage:
              mapType === "vector"
                ? "radial-gradient(var(--color-border) 1.5px, transparent 1.5px)"
                : "radial-gradient(oklch(0.180 0.005 270) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* Mock Street Overlay */}
          <div className={`absolute inset-0 opacity-20 pointer-events-none transition-opacity ${mapType === "vector" ? "dark:opacity-10" : "opacity-30"}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <line x1="10%" y1="0%" x2="10%" y2="100%" stroke="var(--color-muted)" strokeWidth="1" />
              <line x1="35%" y1="0%" x2="35%" y2="100%" stroke="var(--color-muted)" strokeWidth="1" />
              <line x1="55%" y1="0%" x2="55%" y2="100%" stroke="var(--color-muted)" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="80%" y1="0%" x2="80%" y2="100%" stroke="var(--color-muted)" strokeWidth="1" />
              <line x1="0%" y1="20%" x2="100%" y2="20%" stroke="var(--color-muted)" strokeWidth="1" />
              <line x1="0%" y1="45%" x2="100%" y2="45%" stroke="var(--color-muted)" strokeWidth="1.5" />
              <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="var(--color-muted)" strokeWidth="1" />
            </svg>
          </div>

          {/* Compass / Coordinate HUD overlay */}
          <div className="absolute bottom-4 right-4 text-[10px] font-mono text-muted/60 bg-surface/50 border border-border/40 px-2 py-1 rounded pointer-events-none">
            GEO: {selectedCity === "Bangalore" ? "12.9716° N, 77.5946° E" : "19.0760° N, 72.8777° E"}
          </div>

          {/* Render Pulsing Pins */}
          {mappedPoints.map((pt) => {
            const meta = CATEGORY_META[pt.category];
            const isSelected = selectedComplaint?.id === pt.id;

            return (
              <div
                key={pt.id}
                className="absolute transition-all duration-normal"
                style={{
                  left: `${pt.mapX}%`,
                  top: `${pt.mapY}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Click target wrapper (Touch Target compliance) */}
                <button
                  onClick={() => setSelectedComplaint(pt)}
                  className="relative group p-6 -m-6 focus:outline-none"
                  aria-label={`Select report pin: ${pt.title}`}
                  aria-pressed={isSelected}
                >
                  {/* Outer Pulsing Aura */}
                  {isSelected && (
                    <motion.span
                      layoutId="pulse-aura"
                      animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 m-auto w-10 h-10 rounded-full pointer-events-none bg-primary/20"
                      style={{ willChange: "transform, opacity" }}
                    />
                  )}

                  {/* Pin Dot */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform duration-fast hover:scale-125 border ${
                      isSelected
                        ? "bg-primary border-primary-foreground text-primary-foreground scale-110"
                        : "bg-surface border-border text-foreground hover:bg-surface-raised"
                    }`}
                  >
                    <span className="text-sm leading-none">{meta?.icon || "📍"}</span>
                  </div>

                  {/* Tiny label on hover */}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-surface border border-border text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap text-foreground">
                    {pt.title.substring(0, 15)}...
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Complaint Detail Popover Drawer */}
        <AnimatePresence>
          {selectedComplaint && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-4 left-4 right-4 z-20 mx-auto max-w-[500px]"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="bg-surface/95 border border-border backdrop-blur-md rounded-lg p-5 shadow-lg flex gap-4">
                {/* Left side preview image */}
                <div className="w-20 h-20 rounded-sm overflow-hidden border border-border flex-shrink-0 bg-background select-none">
                  <img
                    src={selectedComplaint.imageUrl}
                    alt={selectedComplaint.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right side text detail */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                      {CATEGORY_META[selectedComplaint.category]?.label}
                    </span>
                    <StatusBadge status={selectedComplaint.status} size="sm" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground truncate">
                    {selectedComplaint.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                    <span className="truncate">{selectedComplaint.location.address}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="text-[10px] font-mono text-muted">{selectedComplaint.id}</span>
                    <Link
                      href={`/report/${selectedComplaint.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors h-10 px-2 rounded hover:bg-primary/5"
                      aria-label="Navigate to agent pipeline details for this complaint"
                    >
                      <span>Track Agent Pipeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
