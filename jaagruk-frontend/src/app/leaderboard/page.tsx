"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Search,
  Filter,
  Medal,
  Award,
  Sparkles,
  Zap,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { MOCK_LEADERBOARD, LeaderboardEntry } from "@/lib/mock-data";

export default function LeaderboardPage() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter leaderboard entries based on city and search query
  const filteredLeaderboard = useMemo(() => {
    return MOCK_LEADERBOARD.filter((entry) => {
      const matchesCity = selectedCity === "all" || entry.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [selectedCity, searchQuery]);

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-surface/40 to-accent/5 border border-border rounded-lg p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/20">
            <Sparkles className="w-3 h-3" /> Community Heroes
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Citizen Guard Honor Roll</h1>
          <p className="text-sm text-muted">
            Recognizing citizens who actively spot, report, and help fix urban anomalies. Every verified report contributes to a safer, more accountable community.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-full bg-accent/10 border border-accent/20 text-accent">
          <Trophy className="w-12 h-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Leaderboard Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface border border-border p-4 rounded-lg shadow-sm">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search citizen heroes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-sm border border-border bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            {/* City filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs font-semibold px-2 py-1.5 border border-border bg-background rounded-sm focus:outline-none w-full sm:w-auto"
              >
                <option value="all">All Cities</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>
          </div>

          {/* Leaderboard Table List */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="divide-y divide-border/60">
              {filteredLeaderboard.map((entry, idx) => {
                // Style Top 3 differently
                const isTopThree = entry.rank <= 3;
                const medalColors = ["text-amber-500", "text-slate-400", "text-amber-700"];

                return (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-border/10 transition-colors"
                  >
                    {/* Rank & Profile Name */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rank badge */}
                      <div className="w-8 flex-shrink-0 flex items-center justify-center">
                        {isTopThree ? (
                          <Medal className={`w-6 h-6 ${medalColors[entry.rank - 1]}`} />
                        ) : (
                          <span className="text-xs font-mono font-bold text-muted">{entry.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-extrabold text-primary flex-shrink-0">
                        {entry.avatar}
                      </div>

                      {/* Name & City */}
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-foreground truncate">{entry.name}</div>
                        <div className="text-xs text-muted font-semibold">{entry.city}</div>
                      </div>
                    </div>

                    {/* Stats Metrics */}
                    <div className="flex items-center gap-6 md:gap-12 flex-shrink-0 text-right">
                      {/* Reports Stats */}
                      <div className="hidden sm:block">
                        <div className="text-[10px] uppercase font-bold text-muted">Reports / Resolved</div>
                        <div className="text-xs font-bold text-foreground mt-0.5">
                          {entry.reportsSubmitted} / <span className="text-success">{entry.reportsResolved}</span>
                        </div>
                      </div>

                      {/* Impact Score */}
                      <div>
                        <div className="text-[10px] uppercase font-bold text-muted">Impact Score</div>
                        <div className="text-sm font-extrabold text-accent flex items-center gap-1 justify-end mt-0.5">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>{entry.impactScore.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Scoring Guidelines & Info */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-bold">How points are calculated</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              We reward proactive civic contributions. Points are awarded once the AI agent validator verifies the submission:
            </p>

            <ul className="space-y-3 text-xs text-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <div>
                  <span className="font-semibold text-foreground">+50 Points</span> for submitting a validated report.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <div>
                  <span className="font-semibold text-foreground">+200 Points</span> when your report is marked as resolved by the municipal body.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <div>
                  <span className="font-semibold text-foreground">+10 Points</span> for every upvote received from community members validating your issue.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <div>
                  <span className="font-semibold text-foreground">+5 Points</span> for validating or upvoting another verified citizen complaint.
                </div>
              </li>
            </ul>
          </div>

          {/* User Score Card Mock */}
          <div className="bg-primary-subtle border border-primary/20 rounded-lg p-6 md:p-8 shadow-sm text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-extrabold">
              U
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Your Rank</h4>
              <p className="text-xs text-muted mt-0.5">Report your first issue to enter the leaderboards!</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-2">
              <div className="border border-border/40 p-2 rounded bg-background/40">
                <div className="text-[10px] uppercase font-bold text-muted">Points</div>
                <div className="font-mono font-bold text-sm text-foreground">0</div>
              </div>
              <div className="border border-border/40 p-2 rounded bg-background/40">
                <div className="text-[10px] uppercase font-bold text-muted">Verified</div>
                <div className="font-mono font-bold text-sm text-foreground">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
