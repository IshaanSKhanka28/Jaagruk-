"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
  // Show first 3 complaints on home page
  const recentComplaints = MOCK_COMPLAINTS.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b border-border bg-gradient-to-b from-background via-surface/30 to-background">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] pointer-events-none opacity-35 dark:opacity-25 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] blur-[100px]" />

        <div className="mx-auto max-w-[1120px] px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Tagline Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20 mb-6">
              <Shield className="w-3.5 h-3.5" /> See It. Report It. Fix It.
            </span>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
              AI-Powered Civic Action <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                For Accountable Cities
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Empower your neighborhood. Upload a photo of a civic issue — pothole, broken streetlight, or garbage dump — and watch our multi-agent AI pipeline translate it into trackable municipal action in 60 seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/report"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md font-semibold bg-accent text-accent-foreground hover:bg-accent-hover hover:scale-[1.02] shadow-md hover:shadow-lg transition-all duration-fast"
              >
                <Camera className="w-5 h-5" /> Report an Issue
              </Link>
              <Link
                href="/map"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md font-semibold bg-surface border border-border hover:bg-border/30 hover:border-border-hover transition-all duration-fast text-foreground"
              >
                View Live Map <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
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

      {/* AI Pipeline Explainer */}
      <section className="py-20 border-b border-border bg-background">
        <div className="mx-auto max-w-[1120px] px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">The AI Multi-Agent Pipeline</h2>
            <p className="text-muted leading-relaxed">
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
                  className="flex flex-col items-start p-6 rounded-lg bg-surface border border-border hover:shadow-md transition-shadow"
                >
                  <div className={`p-3 rounded-md mb-4 border ${agent.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{agent.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{agent.desc}</p>
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
              <div className="absolute inset-0 bg-radial-gradient from-accent/10 to-transparent pointer-events-none" />
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
