"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { AppIcon } from "@/components/ui/Logo";
import {
  Camera,
  MapPin,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  Building2,
  Eye,
  Award,
  ChevronDown,
} from "lucide-react";
import { MOCK_COMPLAINTS, MOCK_DASHBOARD_STATS } from "@/lib/mock-data";
import { ComplaintCard } from "@/components/ui/complaint-card";
import { StatCard } from "@/components/ui/stat-card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
} as const;

const headlineContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const wordVariant = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
} as const;

const PARTICLES = [
  { size: 4, color: "#1D4ED8", top: "20%", left: "15%", duration: 5 },
  { size: 6, color: "#F97316", top: "40%", left: "80%", duration: 7 },
  { size: 3, color: "#1D4ED8", top: "70%", left: "25%", duration: 4 },
  { size: 5, color: "#F97316", top: "15%", left: "70%", duration: 6 },
  { size: 4, color: "#F97316", top: "60%", left: "10%", duration: 8 },
  { size: 6, color: "#1D4ED8", top: "30%", left: "85%", duration: 5 },
  { size: 3, color: "#F97316", top: "80%", left: "60%", duration: 7 },
  { size: 5, color: "#1D4ED8", top: "50%", left: "50%", duration: 6 },
];

const AGENT_PIPELINE = [
  {
    icon: Eye,
    title: "1. Vision Agent",
    desc: "Validates uploaded photographs instantly using computer vision, filtering spam/irrelevant uploads and identifying specific damage type & severity.",
    color: "text-error bg-error/5 border-error/15",
  },
  {
    icon: Zap,
    title: "2. Classification Agent",
    desc: "Extracts metadata, detects categories (Roads, Water, Sanitation, Electrical) and assigns priority levels based on public safety hazards.",
    color: "text-warning bg-warning/5 border-warning/15",
  },
  {
    icon: MapPin,
    title: "3. Routing Agent",
    desc: "Uses geolocation data to identify corresponding municipal administrative wards and forwards files directly to the respective department's officer.",
    color: "text-primary bg-primary/5 border-primary/15",
  },
  {
    icon: Building2,
    title: "4. Complaint Agent",
    desc: "Generates structured formal letters and submissions detailing guidelines violated, and auto-submits reports into government grievance portals.",
    color: "text-success bg-success/5 border-success/15",
  },
  {
    icon: Clock,
    title: "5. Tracking Agent",
    desc: "Monitors status changes from government APIs, alerts you of updates, and enables community upvoting to bump unresolved high-priority issues.",
    color: "text-info bg-info/5 border-info/15",
  },
];

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";

  // Layered background variables
  const baseBg = isDark ? "#020817" : "#F8FAFC";
  const spotlight = isDark ? "rgba(29, 78, 216, 0.18)" : "rgba(59, 130, 246, 0.08)";
  const spotlightOuter = isDark ? "rgba(2, 8, 23, 0)" : "rgba(248, 250, 252, 0)";
  const secondaryGlow = isDark ? "rgba(249, 115, 22, 0.08)" : "rgba(249, 115, 22, 0.04)";
  
  const dotFillColor = isDark ? "white" : "black";
  const dotFillOpacity = isDark ? "0.035" : "0.025";
  const gridLineColor = isDark ? "rgba(29, 78, 216, 0.06)" : "rgba(59, 130, 246, 0.03)";
  const scanLineColor = isDark ? "rgba(29, 78, 216, 0.4)" : "rgba(59, 130, 246, 0.2)";
  
  const bottomFadeColor = isDark ? "#020817" : "#F8FAFC";
  const chevronColor = isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(15, 23, 42, 0.3)";
  const trustBarColor = isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(15, 23, 42, 0.6)";

  // Next section variables (How it Works)
  const nextSectionBg = isDark ? "#040d1e" : "#F1F5F9";
  const nextSectionBorder = isDark ? "1px solid rgba(29, 78, 216, 0.2)" : "1px solid rgba(59, 130, 246, 0.1)";
  const stepCardBg = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(15, 23, 42, 0.02)";
  const stepCardBorder = isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(15, 23, 42, 0.08)";
  const stepNumberColor = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.03)";

  const recentComplaints = MOCK_COMPLAINTS.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden pt-24 pb-24 md:pt-36 md:pb-36 border-b transition-all duration-500"
        style={{
          backgroundColor: baseBg,
          borderColor: isDark ? "rgba(29, 78, 216, 0.2)" : "rgba(226, 232, 240, 1)",
        }}
      >
        {/* Layer 2 — Radial spotlight */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${spotlight} 0%, ${spotlightOuter} 70%)`
          }}
        />

        {/* Layer 3 — Secondary glow bottom right */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            background: `radial-gradient(ellipse 50% 40% at 80% 80%, ${secondaryGlow} 0%, transparent 70%)`
          }}
        />

        {/* Layer 4 — Dot grid pattern */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='1.5' fill='${dotFillColor}' fill-opacity='${dotFillOpacity}'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Layer 5 — Horizontal scan line (animated) */}
        <motion.div
          className="absolute left-0 right-0 h-[1.5px] pointer-events-none"
          style={{
            top: 0,
            background: `linear-gradient(to right, transparent, ${scanLineColor}, transparent)`,
            willChange: "transform",
          }}
          animate={{ y: ["0vh", "80vh"] }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Infinity,
          }}
        />

        {/* Layer 6 — Floating particles */}
        {PARTICLES.map((p, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: 0.3,
              top: p.top,
              left: p.left,
              willChange: "transform",
            }}
            animate={{ y: [-20, 20] }}
            transition={{
              duration: p.duration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}

        {/* Layer 7 — City grid lines (subtle) */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M 80 0 L 0 0 0 80' fill='none' stroke='${gridLineColor}' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Layer 8 — Bottom fade */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[200px] pointer-events-none transition-all duration-500"
          style={{
            background: `linear-gradient(to bottom, transparent, ${bottomFadeColor})`
          }}
        />

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            style={{ willChange: "transform" }}
          >
            <ChevronDown 
              className="w-6 h-6 transition-colors duration-500" 
              style={{ color: chevronColor }}
            />
          </motion.div>
        </div>

        <div className="mx-auto max-w-[1120px] px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
            {/* CHANGE 1 — Logo Lockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center mb-8"
              style={{ willChange: "transform, opacity" }}
            >
              <AppIcon size={80} theme={mounted ? (resolvedTheme as "light" | "dark") : "dark"} />
              <h2 className="mt-3 text-[28px] font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-none">
                Jaagruk
              </h2>
              <div className="mt-3 w-[60px] h-[2px] bg-[#F97316]" />
            </motion.div>

            {/* Tagline Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20 mb-6">
              <Shield className="w-3.5 h-3.5" /> See It. Report It. Fix It.
            </span>

            {/* Title */}
            <motion.h1
              variants={headlineContainer}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6 flex flex-wrap justify-center gap-x-3 gap-y-1.5"
            >
              <div className="flex flex-wrap justify-center gap-x-3">
                <motion.span variants={wordVariant} className="inline-block" style={{ willChange: "transform, opacity" }}>AI-Powered</motion.span>
                <motion.span variants={wordVariant} className="inline-block" style={{ willChange: "transform, opacity" }}>Civic</motion.span>
                <motion.span variants={wordVariant} className="inline-block" style={{ willChange: "transform, opacity" }}>Action</motion.span>
              </div>
              <div className="w-full hidden sm:block h-0" />
              <div className="flex flex-wrap justify-center gap-x-3 text-primary">
                <motion.span variants={wordVariant} className="inline-block" style={{ willChange: "transform, opacity" }}>For</motion.span>
                <motion.span variants={wordVariant} className="inline-block" style={{ willChange: "transform, opacity" }}>Accountable</motion.span>
                <motion.span variants={wordVariant} className="inline-block" style={{ willChange: "transform, opacity" }}>Cities</motion.span>
              </div>
            </motion.h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Empower your neighborhood. Upload a photo of a civic issue — pothole, broken streetlight, or garbage dump — and watch our multi-agent AI pipeline translate it into trackable municipal action in 60 seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                {/* Expanding Pulse Ring */}
                <motion.div
                  className="absolute inset-0 bg-accent/40 rounded-md pointer-events-none"
                  animate={{
                    scale: [1, 1.25, 1.4],
                    opacity: [0.6, 0.2, 0],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeOut",
                    repeat: Infinity,
                  }}
                  style={{ willChange: "transform, opacity" }}
                />
                <Link
                  href="/report"
                  className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md font-semibold bg-accent text-accent-foreground hover:bg-accent-hover hover:scale-[1.02] shadow-md hover:shadow-lg transition-all duration-fast z-10"
                >
                  <Camera className="w-5 h-5" /> Report an Issue
                </Link>
              </div>
              <Link
                href="/map"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md font-semibold bg-surface border border-border hover:bg-border/30 hover:border-border-hover transition-all duration-fast text-foreground"
              >
                View Live Map <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Bar */}
            <div 
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-[13px] font-medium transition-colors duration-500"
              style={{ color: trustBarColor }}
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#F97316] fill-[#F97316]/20" />
                <span>AI Response in 5 seconds</span>
              </div>
              <span className="hidden sm:inline opacity-30">|</span>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#F97316] fill-[#F97316]/20" />
                <span>Verified by Gemini Vision</span>
              </div>
              <span className="hidden sm:inline opacity-30">|</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F97316] fill-[#F97316]/20" />
                <span>Live across 12 cities</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border bg-surface/20">
        <div className="mx-auto max-w-[1120px] px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              icon={TrendingUp}
              value={MOCK_DASHBOARD_STATS.totalReports}
              label="Total Complaints Filed"
            />
            <StatCard
              icon={CheckCircle2}
              value={MOCK_DASHBOARD_STATS.resolved}
              label="Issues Resolved"
            />
            <StatCard
              icon={Clock}
              value={MOCK_DASHBOARD_STATS.avgResolutionHours}
              label="Avg. Resolution (Hrs)"
              suffix="h"
            />
            <StatCard
              icon={Award}
              value={MOCK_DASHBOARD_STATS.citizensEngaged}
              label="Active Citizens"
            />
          </div>
        </div>
      </section>

      {/* AI Pipeline Explainer / How Jaagruk Works */}
      <section 
        className="py-20 border-b transition-all duration-500 relative"
        style={{
          backgroundColor: nextSectionBg,
          borderTop: nextSectionBorder,
          borderColor: isDark ? "rgba(29, 78, 216, 0.2)" : "rgba(226, 232, 240, 1)",
        }}
      >
        <div className="mx-auto max-w-[1120px] px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight">How Jaagruk Works</h2>
            <div className="mt-2 h-[3px] w-[40px] bg-[#F97316] rounded-full" />
            <p className="text-muted leading-relaxed mt-6">
              When you submit a complaint, Jaagruk launches a specialized squad of artificial intelligence agents to analyze, route, file, and track the issue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {AGENT_PIPELINE.map((agent, idx) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="relative flex flex-col items-start p-6 rounded-lg transition-all duration-300 overflow-hidden"
                  style={{
                    backgroundColor: stepCardBg,
                    border: stepCardBorder,
                    willChange: "transform, opacity",
                  }}
                  whileHover={{
                    borderColor: isDark ? "rgba(29,78,216,0.4)" : "rgba(59,130,246,0.3)",
                    backgroundColor: isDark ? "rgba(29,78,216,0.06)" : "rgba(59,130,246,0.04)",
                  }}
                >
                  <span
                    className="absolute top-2 right-4 font-mono font-extrabold select-none pointer-events-none transition-colors duration-500"
                    style={{
                      fontSize: "64px",
                      color: stepNumberColor,
                      lineHeight: 1,
                    }}
                  >
                    {`0${idx + 1}`}
                  </span>
                  <div className={`p-3 rounded-md mb-4 border ${agent.color} relative z-10`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 relative z-10">{agent.title}</h3>
                  <p className="text-sm text-muted leading-relaxed relative z-10">{agent.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Active Feed */}
      <section className="py-20 bg-surface/10">
        <div className="mx-auto max-w-[1120px] px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Live Issue Feed</h2>
              <p className="text-muted">Real-time reports filed by citizens across key municipal wards.</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors group"
            >
              Explore Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {recentComplaints.map((complaint) => (
              <motion.div key={complaint.id} variants={itemVariants}>
                <ComplaintCard complaint={complaint} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Hero Citizen Spotlight */}
      <section className="py-20 border-t border-border bg-gradient-to-t from-background to-surface/30">
        <div className="mx-auto max-w-[1120px] px-4">
          <div className="bg-surface border border-border rounded-lg p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
                Community Heroes
              </span>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Join the Citizen Shield Network
              </h2>
              <p className="text-muted leading-relaxed mb-6">
                Cities improve when citizens participate. With Jaagruk, your contribution is recognized. Earn impact points, unlock badges, and help guide municipal teams to the areas needing the most critical work.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
                >
                  Meet Top Contributors
                </Link>
              </div>
            </div>
            <div className="w-full md:w-[320px] aspect-square rounded-lg overflow-hidden border border-border bg-background relative flex items-center justify-center p-8">
              {/* Symbolic visual badge */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)] opacity-15 pointer-events-none" />
              <div className="text-center relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center mb-4">
                  <Award className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-1">Citizen Honor Roll</h4>
                <p className="text-xs text-muted max-w-[200px]">
                  Awarded to individuals with over 10 resolved reports this month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
