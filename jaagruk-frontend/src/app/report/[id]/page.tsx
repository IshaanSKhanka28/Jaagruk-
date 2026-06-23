"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAccessibility } from "@/hooks/useAccessibility";
import {
  MapPin,
  Calendar,
  User,
  ThumbsUp,
  ArrowLeft,
  Terminal,
  ShieldCheck,
  Globe,
  Building,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { getComplaintById, CATEGORY_META, STATUS_META, Complaint } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { screenReader, reducedMotion } = useAccessibility();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [showRawLogs, setShowRawLogs] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Check session storage first (for newly created reports)
    const stored = sessionStorage.getItem(id);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Complaint;
        setComplaint(parsed);
        setUpvoteCount(parsed.upvotes);
        return;
      } catch (err) {
        console.error("Error parsing stored complaint:", err);
      }
    }

    // Fallback to static mock data
    const found = getComplaintById(id);
    if (found) {
      setComplaint(found);
      setUpvoteCount(found.upvotes);
    }
  }, [id]);

  if (!complaint) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4 animate-bounce" />
        <h1 className="text-xl font-bold mb-2 text-foreground tracking-tight">Complaint Not Found</h1>
        <p className="text-muted mb-6">The report ID `{id}` could not be resolved.</p>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 h-12 px-6 border border-border rounded-sm hover:bg-surface-raised transition-colors text-sm font-bold text-foreground select-none"
          aria-label={screenReader ? "Return to the main homepage" : "Back to Home"}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    );
  }

  const categoryInfo = CATEGORY_META[complaint.category];
  const statusInfo = STATUS_META[complaint.status];

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvoteCount((prev) => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvoteCount((prev) => prev + 1);
      setHasUpvoted(true);
    }
  };

  const transitionVars = reducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-12">
      {/* Back CTA (Touch Target: 48px height) */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 h-12 px-4 text-sm font-bold text-muted hover:text-foreground mb-8 transition-colors rounded hover:bg-surface select-none"
        aria-label={screenReader ? "Navigate back to the previous view" : "Back"}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Image, Description, AI Agent Diagnostics */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="relative aspect-video w-full border-b border-border bg-background flex items-center justify-center select-none pointer-events-none">
              <img
                src={complaint.imageUrl}
                alt={complaint.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <StatusBadge status={complaint.status} size="md" />
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <span className="text-2xl mr-2 select-none">{categoryInfo?.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted select-none">
                  {categoryInfo?.label || complaint.category}
                </span>
                <h1 
                  className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-foreground"
                  style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
                >
                  {complaint.title}
                </h1>
                <div className="text-xs font-mono text-muted mt-1 select-all">ID: {complaint.id}</div>
              </div>

              {/* Meta information row */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-muted border-y border-border/50 py-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{complaint.location.address}, {complaint.location.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Reported {new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" />
                  <span>By {complaint.reportedBy.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Citizen Description</h3>
                <p className="text-foreground leading-normal whitespace-pre-line max-w-[65ch]">
                  {complaint.description}
                </p>
              </div>

              {/* Action row (Upvote) - Touch Target: 48px height */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/40">
                <button
                  onClick={handleUpvote}
                  className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-bold border transition-all select-none ${
                    hasUpvoted
                      ? "bg-primary border-primary text-primary-foreground shadow-sm scale-95"
                      : "bg-background border-border text-foreground hover:bg-surface-raised"
                  }`}
                  aria-label={screenReader ? "Upvote this civic report to draw administrative priority attention" : "Upvote report"}
                  aria-pressed={hasUpvoted}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-current" : ""}`} />
                  <span>{hasUpvoted ? "Upvoted" : "Upvote Complaint"}</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-black/10 dark:bg-white/10 font-mono font-bold">
                    {upvoteCount}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Multi-Agent Diagnostic Panel */}
          <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold">AI Agent Diagnostics</h2>
              </div>
              <button
                onClick={() => setShowRawLogs(!showRawLogs)}
                className="text-xs font-bold text-primary hover:text-primary-hover transition-colors h-10 px-3 rounded hover:bg-primary/5 select-none"
                aria-label={screenReader ? "Toggle visual display between agent cards and raw diagnostic JSON files" : "Toggle raw logs"}
              >
                {showRawLogs ? "Show Decoded Output" : "View Raw JSON Log"}
              </button>
            </div>

            {showRawLogs ? (
              <pre className="p-4 rounded-sm bg-background border border-border font-mono text-xs overflow-x-auto max-h-96 text-muted select-all leading-normal">
                {JSON.stringify(complaint, null, 2)}
              </pre>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vision Audit */}
                <div className="p-4 rounded-sm border border-border bg-background/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <span>Vision Auditor</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted">
                    <div><span className="font-semibold text-foreground">Valid Status:</span> Confirmed</div>
                    <div><span className="font-semibold text-foreground">Confidence Score:</span> 96.8%</div>
                    <div><span className="font-semibold text-foreground">Object Detected:</span> {categoryInfo?.label || complaint.category} anomaly</div>
                  </div>
                </div>

                {/* Classifier Audit */}
                <div className="p-4 rounded-sm border border-border bg-background/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <Globe className="w-4 h-4 text-warning" />
                    <span>Classification Auditor</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted">
                    <div><span className="font-semibold text-foreground">Assigned Tag:</span> {complaint.category.toUpperCase()}</div>
                    <div><span className="font-semibold text-foreground">Severity Rank:</span> High</div>
                    <div><span className="font-semibold text-foreground">Priority Rating:</span> Urgent</div>
                  </div>
                </div>

                {/* Router Audit */}
                <div className="p-4 rounded-sm border border-border bg-background/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <Building className="w-4 h-4 text-primary" />
                    <span>Routing Auditor</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted">
                    <div><span className="font-semibold text-foreground">Jurisdiction:</span> municipal/{complaint.location.city.toLowerCase()}</div>
                    <div><span className="font-semibold text-foreground">Target Agency:</span> Ward Division {complaint.location.city === "Bangalore" ? "BBMP" : "BMC"}</div>
                    <div><span className="font-semibold text-foreground">Officer Assigned:</span> Ward Inspector {complaint.location.city === "Bangalore" ? "BBMP-86" : "BMC-42"}</div>
                  </div>
                </div>

                {/* Complaint Audit */}
                <div className="p-4 rounded-sm border border-border bg-background/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <FileSpreadsheet className="w-4 h-4 text-info" />
                    <span>Complaint Auditor</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted">
                    <div><span className="font-semibold text-foreground">Submission Code:</span> {complaint.id}</div>
                    <div><span className="font-semibold text-foreground">API Sync:</span> Successful</div>
                    <div><span className="font-semibold text-foreground">Auto-Grievance:</span> Filed</div>
                  </div>
                </div>

                {/* Generated official letter draft */}
                <div className="col-span-1 md:col-span-2 p-4 rounded-sm border border-border bg-background/50 space-y-2">
                  <div className="font-semibold text-sm text-foreground border-b border-border/40 pb-2">Auto-Drafted Formal Complaint Letter</div>
                  <p className="text-xs font-mono text-muted border border-border/40 p-3 rounded-sm bg-background leading-relaxed select-all">
                    To,<br />
                    The Ward Grievance Officer,<br />
                    Municipal Corporation of {complaint.location.city}<br /><br />
                    SUBJECT: Grievance regarding {complaint.category} at {complaint.location.address}.<br /><br />
                    This is an official grievance report regarding a serious {complaint.category} anomaly at {complaint.location.address}. The issue has been registered with ID {complaint.id} under Jaagruk Civic Shield rules. Visual validation confirms safety violation parameters. Request immediate dispatch and correction.<br /><br />
                    Sincerely,<br />
                    Jaagruk Civic Agent (on behalf of {complaint.reportedBy.name})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Timeline & Routing Details */}
        <div className="space-y-8">
          {/* Status Timeline */}
          <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-6">
            <h3 
              className="text-lg font-bold tracking-tight"
              style={{ textWrap: "balance", lineHeight: "var(--leading-tight)" }}
            >
              Complaint Lifecycle
            </h3>

            <div className="relative border-l border-border pl-6 ml-2 space-y-8">
              {complaint.timeline.map((event) => {
                const isActive = event.status === "active";
                const isCompleted = event.status === "completed";

                return (
                  <div key={event.id} className="relative">
                    {/* Timeline Node Icon */}
                    <div
                      className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border transition-all duration-normal flex items-center justify-center ${
                        isCompleted
                          ? "bg-success border-success text-white"
                          : isActive
                          ? "bg-accent border-accent text-white"
                          : "bg-surface border-border text-transparent"
                      } ${isActive && !reducedMotion ? "animate-pulse" : ""}`}
                    >
                      {isCompleted && <span className="text-[8px] font-bold select-none pointer-events-none">✓</span>}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            isCompleted ? "text-foreground" : isActive ? "text-accent" : "text-muted"
                          }`}
                        >
                          {event.stage}
                        </span>
                        {event.timestamp && (
                          <span className="text-[10px] font-mono text-muted">
                            {new Date(event.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{event.description}</p>
                      {event.agent && (
                        <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-muted select-none">
                          🤖 {event.agent}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
