"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccessibility } from "@/hooks/useAccessibility";
import {
  Trophy,
  Search,
  Filter,
  Medal,
  Zap,
  BookOpen,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { getIssues } from "@/lib/api";

const getBadges = (reports: number) => {
  const badges = [];
  if (reports >= 1) badges.push("🌱 First Report");
  if (reports >= 5) badges.push("📢 Voice");
  if (reports >= 10) badges.push("🛡️ Guardian");
  if (reports >= 20) badges.push("🏆 City Hero");
  return badges;
};

export default function LeaderboardPage() {
  const { screenReader } = useAccessibility();
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const data = await getIssues();
      // Normalize raw issues so they carry clean cities, category names and status
      const normalized = (data || []).map((i: any) => {
        const rawStatus = (i.status || "").toUpperCase();
        const rawCategory = (i.category || "").toUpperCase();
        const city = i.city || (i.location && i.location.city) || "Bangalore";
        
        return {
          ...i,
          id: i.id,
          citizen_id: i.citizen_id || i.citizenId || "anonymous",
          status: rawStatus,
          category: rawCategory,
          city: city
        };
      });
      setIssues(normalized);
    } catch (e) {
      console.error("Failed to fetch issues in leaderboard page:", e);
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // 2. Group by citizen_id and count, compute points, and assign badges:
  const leaderboard = useMemo(() => {
    const citizenMap: Record<string, {
      id: string;
      name: string;
      avatar: string;
      reports: number;
      points: number;
      resolved: number;
      city: string;
    }> = {};

    issues.forEach(issue => {
      const id = issue.citizen_id || "anonymous";
      if (!citizenMap[id]) {
        citizenMap[id] = {
          id,
          name: id === "anonymous" 
            ? "Anonymous Citizen" 
            : `Citizen ${id.slice(0, 6)}`,
          avatar: id === "anonymous" ? "AC" : id.slice(0, 2).toUpperCase(),
          reports: 0,
          points: 0,
          resolved: 0,
          city: issue.city || "Bangalore"
        };
      }
      
      citizenMap[id].reports += 1;
      citizenMap[id].points += 10;
      
      if (issue.status === "RESOLVED") {
        citizenMap[id].resolved += 1;
        citizenMap[id].points += 50;
      }
    });

    // 3. Sort by points descending:
    return Object.values(citizenMap)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
  }, [issues]);

  // Filter rankings based on city and search queries
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter((entry) => {
      const matchesCity = selectedCity === "all" || entry.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [leaderboard, selectedCity, searchQuery]);

  const isEmpty = leaderboard.length === 0;

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-surface/40 to-accent/5 border border-border rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/20 w-fit select-none">
            <Sparkles className="w-3.5 h-3.5" /> Community Heroes
          </span>
          <h1 
            className="text-3xl font-extrabold tracking-tight text-foreground"
            style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
          >
            Citizen Guard Honor Roll
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Recognizing citizens who actively spot, report, and help fix urban anomalies. Every verified report contributes to a safer, more accountable community.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 border border-accent/20 text-accent select-none">
            <Trophy className="w-10 h-10 animate-pulse" style={{ animationDuration: "3s" }} />
          </div>
          <button
            onClick={fetchIssues}
            disabled={isLoading}
            className="h-10 px-4 flex items-center justify-center gap-2 border border-border bg-surface hover:bg-border/20 rounded-md text-xs font-bold transition-all select-none cursor-pointer disabled:opacity-50"
            aria-label={screenReader ? "Refresh leaderboard rankings data" : "Refresh leaderboard"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* 6. Show empty state if leaderboard is empty (no issues yet) */}
      {isEmpty && !isLoading ? (
        <div className="bg-surface border border-border rounded-lg p-12 shadow-sm text-center space-y-6 flex flex-col items-center justify-center">
          <span className="text-5xl select-none" role="img" aria-label="superhero">🦸</span>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">No reports yet. Be the first civic hero! 🦸</h2>
            <p className="text-sm text-muted max-w-[50ch] leading-relaxed">
              Spot an issue in your neighbourhood? Submit a report now to register anomalies and start climbing the ranks!
            </p>
          </div>
          <Link
            href="/report"
            className="h-12 px-6 flex items-center justify-center bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded text-sm transition-all shadow-md select-none cursor-pointer"
          >
            Report an Issue
          </Link>
        </div>
      ) : (
        <>
          {/* Podium display (visible only when no filtering query is active to preserve rankings structure) */}
          {!searchQuery && selectedCity === "all" && !isLoading && leaderboard.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm flex flex-col items-center justify-center gap-6">
              <h2 className="text-xl font-bold tracking-tight text-center text-foreground select-none">
                Podium Leaders
              </h2>
              
              <div className="flex flex-col sm:flex-row items-end justify-center gap-8 w-full max-w-lg mt-6">
                {/* 2nd Place */}
                {leaderboard[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col items-center w-full sm:w-36 text-center order-2 sm:order-1"
                  >
                    <div className="relative mb-3">
                      <div className="w-14 h-14 rounded-full bg-slate-400/10 border-2 border-slate-400 flex items-center justify-center text-base font-extrabold text-slate-400 select-none">
                        {leaderboard[1].avatar}
                      </div>
                      <div className="absolute -top-1 -right-1 bg-slate-400 text-white rounded-full p-0.5 border border-border select-none">
                        <Medal className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-foreground truncate max-w-[130px]">{leaderboard[1].name}</h4>
                      <div className="flex flex-wrap justify-center gap-1 mt-1">
                        {getBadges(leaderboard[1].reports).map((badge) => (
                          <span key={badge} className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-border/40 text-muted select-none">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 w-full h-20 bg-gradient-to-t from-slate-500/10 to-slate-500/5 border-t border-x border-slate-400/20 rounded-t-lg flex flex-col justify-between p-2.5">
                      <span className="text-3xl font-extrabold text-slate-400/40 select-none">2</span>
                      <div className="text-[10px] font-mono font-bold text-muted">
                        <span>{leaderboard[1].points} pts</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {leaderboard[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 55 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center w-full sm:w-40 text-center order-1 sm:order-2"
                  >
                    <div className="relative mb-3 scale-110">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-lg font-extrabold text-amber-500 select-none">
                        {leaderboard[0].avatar}
                      </div>
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border border-border select-none">
                        <Trophy className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: "3s" }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-foreground truncate max-w-[140px]">{leaderboard[0].name}</h4>
                      <div className="flex flex-wrap justify-center gap-1 mt-1">
                        {getBadges(leaderboard[0].reports).map((badge) => (
                          <span key={badge} className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20 select-none">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 w-full h-28 bg-gradient-to-t from-amber-500/15 to-amber-500/5 border-t border-x border-amber-500/30 rounded-t-lg flex flex-col justify-between p-2.5 ring-2 ring-amber-500/10">
                      <span className="text-4xl font-extrabold text-amber-500/40 select-none">1</span>
                      <div className="text-[10px] font-mono font-bold text-accent">
                        <span>{leaderboard[0].points} pts</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {leaderboard[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col items-center w-full sm:w-36 text-center order-3 sm:order-3"
                  >
                    <div className="relative mb-3">
                      <div className="w-14 h-14 rounded-full bg-amber-700/10 border-2 border-amber-700 flex items-center justify-center text-base font-extrabold text-amber-700 select-none">
                        {leaderboard[2].avatar}
                      </div>
                      <div className="absolute -top-1 -right-1 bg-amber-700 text-white rounded-full p-0.5 border border-border select-none">
                        <Medal className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-foreground truncate max-w-[130px]">{leaderboard[2].name}</h4>
                      <div className="flex flex-wrap justify-center gap-1 mt-1">
                        {getBadges(leaderboard[2].reports).map((badge) => (
                          <span key={badge} className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-border/40 text-muted select-none">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 w-full h-16 bg-gradient-to-t from-amber-700/10 to-amber-700/5 border-t border-x border-amber-700/20 rounded-t-lg flex flex-col justify-between p-2.5">
                      <span className="text-3xl font-extrabold text-amber-700/40 select-none">3</span>
                      <div className="text-[10px] font-mono font-bold text-muted">
                        <span>{leaderboard[2].points} pts</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Main Content Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Rankings Table List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface border border-border p-4 rounded-lg shadow-sm">
                {/* Search Input */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search citizen heroes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-9 pr-4 rounded-sm border border-border bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground transition-all"
                    aria-label={screenReader ? "Search citizen heroes by name" : "Search heroes"}
                    role="searchbox"
                  />
                </div>

                {/* City Selection Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-muted hidden sm:block" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="text-xs font-semibold px-3 h-12 border border-border bg-background rounded-sm focus:outline-none w-full sm:w-auto text-foreground transition-all cursor-pointer"
                    aria-label={screenReader ? "Filter leaderboard entries by city location" : "Filter by city"}
                    role="combobox"
                  >
                    <option value="all">All Cities</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>

              {/* Rankings table container */}
              <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="divide-y divide-border/60">
                  {isLoading ? (
                    [1, 2, 3, 4].map((n) => (
                      <div key={n} className="p-4 flex items-center justify-between gap-4 animate-pulse">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-6 h-6 bg-border/40 rounded-full" />
                          <div className="w-10 h-10 bg-border/40 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-border/40 w-1/4 rounded" />
                            <div className="h-3 bg-border/40 w-1/6 rounded" />
                          </div>
                        </div>
                        <div className="h-4 bg-border/40 w-20 rounded" />
                      </div>
                    ))
                  ) : filteredLeaderboard.length === 0 ? (
                    <div className="p-12 text-center text-sm text-muted">
                      No citizen heroes found matching the parameters.
                    </div>
                  ) : (
                    filteredLeaderboard.map((entry, idx) => {
                      const absoluteRank = leaderboard.findIndex(item => item.id === entry.id) + 1;
                      const isTopThree = absoluteRank <= 3;
                      const medalColors = ["text-amber-500", "text-slate-400", "text-amber-700"];

                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-border/10 transition-colors"
                          style={{ willChange: "transform, opacity" }}
                        >
                          {/* Rank & Profile Name */}
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Rank badge */}
                            <div className="w-8 flex-shrink-0 flex items-center justify-center">
                              {isTopThree ? (
                                <Medal className={`w-6 h-6 ${medalColors[absoluteRank - 1]}`} />
                              ) : (
                                <span className="text-xs font-mono font-bold text-muted">{absoluteRank}</span>
                              )}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-extrabold text-primary flex-shrink-0 select-none">
                              {entry.avatar}
                            </div>

                            {/* Name & City */}
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground truncate">{entry.name}</span>
                                <div className="hidden sm:flex flex-wrap gap-1">
                                  {getBadges(entry.reports).map((badge) => (
                                    <span key={badge} className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-border/40 text-muted select-none">
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-muted font-semibold">{entry.city}</div>
                            </div>
                          </div>

                          {/* Stats Metrics */}
                          <div className="flex items-center gap-6 md:gap-12 flex-shrink-0 text-right">
                            {/* Reports Stats */}
                            <div>
                              <div className="text-[10px] uppercase font-bold text-muted">Reports / Resolved</div>
                              <div className="text-xs font-bold text-foreground mt-0.5">
                                {entry.reports} / <span className="text-success">{entry.resolved}</span>
                              </div>
                            </div>

                            {/* Impact Score */}
                            <div>
                              <div className="text-[10px] uppercase font-bold text-muted">Impact Score</div>
                              <div className="text-sm font-extrabold text-accent flex items-center gap-1 justify-end mt-0.5 select-none">
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span>{entry.points.toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Scoring Guidelines & Info */}
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 
                    className="font-bold"
                    style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
                  >
                    Honor Badges
                  </h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Citizens earn higher honor badges dynamically as their reported count increments across municipal channels:
                </p>
                <div className="space-y-2.5 pt-1.5 text-xs text-muted">
                  <div className="flex items-center gap-2 bg-background/50 border border-border/30 p-2 rounded">
                    <span className="text-base select-none">🌱</span>
                    <div>
                      <div className="font-bold text-foreground">First Report</div>
                      <div>1+ reported issue</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-background/50 border border-border/30 p-2 rounded">
                    <span className="text-base select-none">📢</span>
                    <div>
                      <div className="font-bold text-foreground">Voice</div>
                      <div>5+ reported issues</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-background/50 border border-border/30 p-2 rounded">
                    <span className="text-base select-none">🛡️</span>
                    <div>
                      <div className="font-bold text-foreground">Guardian</div>
                      <div>10+ reported issues</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-background/50 border border-border/30 p-2 rounded">
                    <span className="text-base select-none">🏆</span>
                    <div>
                      <div className="font-bold text-foreground">City Hero</div>
                      <div>20+ reported issues</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3 select-none">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 
                    className="font-bold"
                    style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
                  >
                    Point Distribution
                  </h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  We reward proactive civic contributions. Points are awarded once the AI agent validator verifies the submission:
                </p>

                <ul className="space-y-3 text-xs text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5 select-none">•</span>
                    <div>
                      <span className="font-semibold text-foreground">+10 Points</span> for submitting a report.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5 select-none">•</span>
                    <div>
                      <span className="font-semibold text-foreground">+50 Points</span> when your report status is marked as resolved.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
