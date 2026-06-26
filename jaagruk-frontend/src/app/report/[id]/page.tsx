"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Check,
  Clock,
  AlertCircle
} from "lucide-react";
import { 
  getComplaintById, 
  CATEGORY_META, 
  STATUS_META, 
  Complaint, 
  ComplaintCategory, 
  ComplaintStatus, 
  TimelineEvent 
} from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { getIssue, upvoteIssue, downloadPDF } from "@/lib/api";

// --- Custom Components ---

const SeverityDots = ({ severity }: { severity: number }) => {
  return (
    <div className="flex items-center gap-1" aria-label={`Severity level ${severity} of 5`}>
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={`w-2.5 h-2.5 rounded-full border transition-all duration-normal ${
            dot <= severity 
              ? "bg-error border-error" 
              : "bg-transparent border-border"
          }`}
        />
      ))}
      <span className="text-xs font-semibold text-muted ml-1.5 font-mono">Sev {severity}/5</span>
    </div>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors: Record<string, string> = {
    LOW: "bg-surface text-muted border-border",
    MEDIUM: "bg-info/10 text-info border-info/20",
    HIGH: "bg-warning/10 text-warning border-warning/20",
    URGENT: "bg-error/10 text-error border-error/20"
  };
  const colorClass = colors[priority.toUpperCase()] || "bg-surface text-muted border-border";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${colorClass}`}>
      {priority} Priority
    </span>
  );
};

const CategoryBadge = ({ category }: { category: ComplaintCategory }) => {
  const meta = CATEGORY_META[category];
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-surface border border-border text-foreground font-semibold text-xs uppercase tracking-wider select-none">
      <span className="text-sm">{meta?.icon || "📋"}</span>
      <span>{meta?.label || category}</span>
    </span>
  );
};

interface AgentStepCardProps {
  agentName: string;
  stageTitle: string;
  status: "pending" | "running" | "done";
  reasoning?: string;
  timestamp?: string;
  reducedMotion?: boolean;
}

function AgentStepCard({
  agentName,
  stageTitle,
  status,
  reasoning,
  timestamp,
  reducedMotion
}: AgentStepCardProps) {
  const isDone = status === "done";
  const isRunning = status === "running";
  
  return (
    <div className={`p-4 rounded-md border transition-all duration-normal ${
      isDone 
        ? "border-success/20 bg-success/5 text-foreground" 
        : isRunning 
        ? "border-accent/40 bg-accent/5 text-foreground shadow-sm shadow-accent/5" 
        : "border-border bg-background/50 text-muted"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            isDone 
              ? "bg-success" 
              : isRunning 
              ? "bg-accent" 
              : "bg-border"
          } ${isRunning && !reducedMotion ? "animate-ping" : ""}`} />
          <h4 className={`text-sm font-bold ${isDone ? "text-foreground" : isRunning ? "text-accent" : "text-muted"}`}>
            {stageTitle}
          </h4>
        </div>
        
        {timestamp && (
          <span className="text-[10px] font-mono text-muted">
            {new Date(timestamp).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            })}
          </span>
        )}
      </div>
      
      <p className="text-xs mt-2 leading-relaxed text-muted">
        {isDone 
          ? reasoning || "Agent execution completed successfully." 
          : isRunning 
          ? "Agent is currently analyzing the request..." 
          : "Waiting in processing queue..."}
      </p>
      
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-border text-muted">
          🤖 {agentName}
        </span>
        {isDone && (
          <span className="text-[10px] font-semibold text-success flex items-center gap-0.5">
            <Check className="w-3 h-3" /> Done
          </span>
        )}
      </div>
    </div>
  );
}

// --- Helpers ---

function mapBackendCategory(category: string): ComplaintCategory {
  const c = (category || "").toLowerCase().replace(/_/g, "-");
  if (c === "damaged-road") return "pothole";
  if (c === "broken-light") return "streetlight";
  if (["pothole", "water-leakage", "streetlight", "garbage", "electrical", "drainage", "other"].includes(c)) {
    return c as ComplaintCategory;
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

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) {
    return dateString;
  }
}

interface MappedComplaint extends Complaint {
  agentLog?: any[];
  severity?: number;
  priority?: string;
  department?: string;
}

const mapBackendIssueToComplaint = (issue: any): MappedComplaint => {
  const category = mapBackendCategory(issue.category);
  const status = mapBackendStatus(issue.status);

  const timeline: TimelineEvent[] = [];
  
  if (issue.agent_log && Array.isArray(issue.agent_log)) {
    const isPipelineDone = issue.agent_log.some((l: any) => l.agent === "Reporter Agent");
    
    issue.agent_log.forEach((log: any, idx: number) => {
      const isLast = idx === issue.agent_log.length - 1;
      
      let eventStatus: "completed" | "active" | "pending" = "completed";
      if (isLast && !isPipelineDone && issue.status !== "REJECTED" && issue.status !== "RESOLVED") {
        eventStatus = "active";
      }
      
      timeline.push({
        id: `t-${idx}`,
        stage: log.agent || "AI Agent Step",
        status: eventStatus,
        description: log.action || log.output?.summary || log.output?.reason || (typeof log.output === "string" ? log.output : ""),
        timestamp: log.timestamp || issue.created_at,
        agent: log.agent
      });
    });
  }

  let title = "Civic Grievance Report";
  let description = issue.description || "";
  if (description.includes("\n\n")) {
    const parts = description.split("\n\n");
    title = parts[0];
    description = parts.slice(1).join("\n\n");
  } else if (description.length > 50) {
    title = description.substring(0, 47) + "...";
  } else if (description.length > 0) {
    title = description;
  }

  const reportedBy = {
    name: issue.citizen_id === "anonymous" ? "Anonymous Citizen" : issue.citizen_id || "Citizen",
    avatar: issue.citizen_id === "anonymous" ? "AC" : (issue.citizen_id || "C").substring(0, 2).toUpperCase()
  };

  return {
    id: String(issue.id),
    title,
    description,
    category,
    status,
    location: {
      address: issue.address || "Unknown Address",
      city: "Bangalore",
      lat: issue.lat || 12.9716,
      lng: issue.lng || 77.5946
    },
    imageUrl: issue.image_url,
    upvotes: issue.upvotes || 0,
    reportedBy,
    createdAt: issue.created_at || new Date().toISOString(),
    updatedAt: issue.updated_at || new Date().toISOString(),
    timeline,
    agentLog: issue.agent_log,
    severity: issue.severity || 1,
    priority: issue.priority || "LOW",
    department: issue.department || ""
  };
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { screenReader, reducedMotion } = useAccessibility();

  const [complaint, setComplaint] = useState<MappedComplaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [showRawLogs, setShowRawLogs] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const toast = {
    success: (message: string) => {
      setToastMessage(message);
      setToastType("success");
      setTimeout(() => setToastMessage(null), 3000);
    },
    error: (message: string) => {
      setToastMessage(message);
      setToastType("error");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Check localStorage for voted state on mount
  useEffect(() => {
    if (!id) return;
    try {
      const voted = JSON.parse(localStorage.getItem("jaagruk_upvoted_issues") || "[]");
      if (voted.includes(id)) {
        setHasUpvoted(true);
      }
    } catch (e) {
      console.error("Failed to read localStorage:", e);
    }
  }, [id]);

  // Main Page Load & Polling Effect
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const fetchIssue = async () => {
      try {
        const issueData = await getIssue(id);
        if (!isMounted) return;

        const mapped = mapBackendIssueToComplaint(issueData);
        setComplaint(mapped);
        setUpvoteCount(mapped.upvotes);
        setIsLoading(false);

        // Polling check: stop if Validator rejected it, OR category is not "OTHER" and Reporter Agent completed, OR status is final.
        const isRejected = issueData.status === "REJECTED";
        const isResolved = issueData.status === "RESOLVED";
        const hasReporterAgent = issueData.agent_log && issueData.agent_log.some((log: any) => log.agent === "Reporter Agent");
        const categoryFullyProcessed = issueData.category && issueData.category !== "OTHER";
        
        const isPipelineDone = isRejected || isResolved || (categoryFullyProcessed && hasReporterAgent);

        if (isPipelineDone && pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      } catch (err) {
        console.error("Error fetching issue from backend:", err);
        // Fallback to static mock data if ID matches mock format (or backend is unreachable)
        if (isMounted) {
          const found = getComplaintById(id);
          if (found) {
            setComplaint(found);
            setUpvoteCount(found.upvotes);
          }
          setIsLoading(false);
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }
      }
    };

    // Initial load
    fetchIssue();

    // Set 3 seconds interval polling
    pollInterval = setInterval(fetchIssue, 3000);

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [id]);

  const handleUpvote = async () => {
    if (hasUpvoted) return;

    // Optimistic Update
    setHasUpvoted(true);
    setUpvoteCount((prev) => prev + 1);

    try {
      await upvoteIssue(id, "anonymous");
      
      const voted = JSON.parse(localStorage.getItem("jaagruk_upvoted_issues") || "[]");
      if (!voted.includes(id)) {
        voted.push(id);
        localStorage.setItem("jaagruk_upvoted_issues", JSON.stringify(voted));
      }
    } catch (err) {
      console.error("Upvote failed:", err);
      // Rollback
      setHasUpvoted(false);
      setUpvoteCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/issues/${id}/pdf`
      );
      
      if (!response.ok) {
        throw new Error("PDF generation failed");
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jaagruk-report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF. Try again.");
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  // Agent Pipeline Processing Steps
  const getAgentSteps = () => {
    if (!complaint) return [];
    const logs = complaint.agentLog || [];
    const valLog = logs.find((l: any) => l.agent === "Validator Agent");
    const classLog = logs.find((l: any) => l.agent === "Classifier Agent");
    const routeLog = logs.find((l: any) => l.agent === "Routing Agent");
    const reportLog = logs.find((l: any) => l.agent === "Reporter Agent");

    const isRejected = complaint.status === "rejected" || (valLog && valLog.output?.valid === false);

    // Validator Step
    let valStatus: "pending" | "running" | "done" = "pending";
    if (valLog) valStatus = "done";
    else if (!isRejected) valStatus = "running";

    // Classifier Step
    let classStatus: "pending" | "running" | "done" = "pending";
    if (classLog) classStatus = "done";
    else if (valLog && valLog.output?.valid !== false && !isRejected) classStatus = "running";

    // Routing Step
    let routeStatus: "pending" | "running" | "done" = "pending";
    if (routeLog) routeStatus = "done";
    else if (classLog && !isRejected) routeStatus = "running";

    // Reporter Step
    let reportStatus: "pending" | "running" | "done" = "pending";
    if (reportLog) reportStatus = "done";
    else if (routeLog && !isRejected) reportStatus = "running";

    return [
      {
        agentName: "Validator Agent",
        stageTitle: "Vision Validation",
        status: valStatus,
        reasoning: valLog ? `Audit: ${valLog.output?.reason || valLog.action}` : undefined,
        timestamp: valLog?.timestamp
      },
      {
        agentName: "Classifier Agent",
        stageTitle: "Category & Severity Analysis",
        status: classStatus,
        reasoning: classLog ? `AI Assessment: ${classLog.output?.description || classLog.action} (Severity: ${classLog.output?.severity}/5)` : undefined,
        timestamp: classLog?.timestamp
      },
      {
        agentName: "Routing Agent",
        stageTitle: "Municipal Department Routing",
        status: routeStatus,
        reasoning: routeLog ? `Routing: Assigned to ${routeLog.output?.department}. priority: ${routeLog.output?.priority}. Reason: ${routeLog.output?.reasoning}` : undefined,
        timestamp: routeLog?.timestamp
      },
      {
        agentName: "Reporter Agent",
        stageTitle: "Official Grievance Drafting",
        status: reportStatus,
        reasoning: reportLog ? `Filing: ${reportLog.output?.summary}` : undefined,
        timestamp: reportLog?.timestamp
      }
    ];
  };

  const transitionVars = reducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const };

  // 1. Loading Skeleton Screen
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-12 space-y-8 animate-pulse">
        {/* Back Button Skeleton */}
        <div className="h-10 w-24 bg-border rounded-md" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface border border-border rounded-lg overflow-hidden h-[360px] md:h-[450px]" />
            <div className="bg-surface border border-border rounded-lg p-6 md:p-8 space-y-6">
              <div className="h-8 w-1/3 bg-border rounded" />
              <div className="h-12 w-3/4 bg-border rounded" />
              <div className="h-6 w-full bg-border rounded" />
              <div className="h-24 w-full bg-border rounded" />
            </div>
          </div>
          
          {/* Sidebar Pipeline Skeleton */}
          <div className="bg-surface border border-border rounded-lg p-6 md:p-8 h-[550px] space-y-4">
            <div className="h-6 w-1/2 bg-border rounded" />
            <div className="h-4 w-3/4 bg-border rounded" />
            <div className="space-y-4 pt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-border/50 rounded border border-border" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Complaint Not Found Screen
  if (!complaint) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4 animate-bounce" />
        <h1 className="text-xl font-bold mb-2 text-foreground tracking-tight">Complaint Not Found</h1>
        <p className="text-muted mb-6">The report ID `{id}` could not be resolved.</p>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 h-12 px-6 border border-border rounded-sm hover:bg-surface-raised transition-colors text-sm font-bold text-foreground select-none cursor-pointer"
          aria-label={screenReader ? "Return to the main homepage" : "Back to Home"}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    );
  }

  const categoryInfo = CATEGORY_META[complaint.category];
  const statusInfo = STATUS_META[complaint.status];

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-12">
      {/* Back CTA (Touch Target: 48px height) */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 h-12 px-4 text-sm font-bold text-muted hover:text-foreground mb-8 transition-colors rounded hover:bg-surface select-none cursor-pointer"
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
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={complaint.category} />
                {complaint.severity && <SeverityDots severity={complaint.severity} />}
                {complaint.priority && <PriorityBadge priority={complaint.priority} />}
              </div>

              <div>
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
                  <span>Reported {formatTimeAgo(complaint.createdAt)}</span>
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

              {/* Department Card */}
              {complaint.department && (
                <div className="bg-background border border-border p-4 rounded-md flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Building className="w-8 h-8 text-primary bg-primary-subtle p-1.5 rounded" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Assigned Department</span>
                      <div className="font-bold text-sm text-foreground">{complaint.department}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action row (Upvote & PDF Download) - Touch Target: 48px height */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/40">
                <button
                  onClick={handleUpvote}
                  disabled={hasUpvoted}
                  className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-bold border transition-all select-none cursor-pointer ${
                    hasUpvoted
                      ? "bg-primary-subtle border-primary text-primary font-semibold opacity-90 cursor-not-allowed"
                      : "bg-background border-border text-foreground hover:bg-surface-raised"
                  }`}
                  aria-label={screenReader ? "Upvote this civic report" : "Upvote report"}
                  aria-pressed={hasUpvoted}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-current text-primary" : ""}`} />
                  <span>{hasUpvoted ? "Upvoted" : "Upvote Complaint"}</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-black/10 dark:bg-white/10 font-mono font-bold">
                    {upvoteCount}
                  </span>
                </button>

                {(() => {
                  const reportLog = complaint.agentLog?.find((log: any) => log.agent === "Reporter Agent");
                  const isMock = !complaint.agentLog;
                  if (isMock || reportLog) {
                    return (
                      <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-bold border border-border bg-background text-foreground hover:bg-surface-raised transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Download Complaint PDF"
                      >
                        {downloading ? (
                          <>⏳ Generating PDF...</>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-4 h-4 text-primary" />
                            <span>Download Complaint PDF</span>
                          </>
                        )}
                      </button>
                    );
                  }
                  return null;
                })()}
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
                className="text-xs font-bold text-primary hover:text-primary-hover transition-colors h-10 px-3 rounded hover:bg-primary/5 select-none cursor-pointer"
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
                {(() => {
                  const valLog = complaint.agentLog?.find((log: any) => log.agent === "Validator Agent");
                  const classLog = complaint.agentLog?.find((log: any) => log.agent === "Classifier Agent");
                  const routeLog = complaint.agentLog?.find((log: any) => log.agent === "Routing Agent");
                  const reportLog = complaint.agentLog?.find((log: any) => log.agent === "Reporter Agent");
                  const isMock = !complaint.agentLog;

                  return (
                    <>
                      {/* Vision Audit */}
                      <div className="p-4 rounded-sm border border-border bg-background/50 space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                          <ShieldCheck className="w-4 h-4 text-success" />
                          <span>Vision Auditor</span>
                        </div>
                        <div className="text-xs space-y-1 text-muted">
                          <div>
                            <span className="font-semibold text-foreground">Valid Status: </span>
                            {isMock ? "Confirmed" : valLog ? (valLog.output?.valid ? "Confirmed" : "Rejected") : "Awaiting..."}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Confidence Score: </span>
                            {isMock ? "96.8%" : valLog ? (valLog.output?.confidence ? `${(valLog.output.confidence * 100).toFixed(1)}%` : "N/A") : "Awaiting..."}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Object Detected: </span>
                            {isMock ? `${categoryInfo?.label || complaint.category} anomaly` : valLog ? (valLog.output?.reason || "Civic anomaly") : "Scanning..."}
                          </div>
                        </div>
                      </div>

                      {/* Classifier Audit */}
                      <div className="p-4 rounded-sm border border-border bg-background/50 space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                          <Globe className="w-4 h-4 text-warning" />
                          <span>Classification Auditor</span>
                        </div>
                        <div className="text-xs space-y-1 text-muted">
                          <div>
                            <span className="font-semibold text-foreground">Assigned Tag: </span>
                            {isMock ? complaint.category.toUpperCase() : classLog ? classLog.output?.category : "Awaiting..."}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Severity Rank: </span>
                            {isMock ? "High" : classLog ? `${classLog.output?.severity || 1}/5` : "Awaiting..."}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Priority Rating: </span>
                            {isMock ? "Urgent" : routeLog ? routeLog.output?.priority : "Awaiting..."}
                          </div>
                        </div>
                      </div>

                      {/* Router Audit */}
                      <div className="p-4 rounded-sm border border-border bg-background/50 space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                          <Building className="w-4 h-4 text-primary" />
                          <span>Routing Auditor</span>
                        </div>
                        <div className="text-xs space-y-1 text-muted">
                          <div>
                            <span className="font-semibold text-foreground">Jurisdiction: </span>
                            municipal/{complaint.location.city.toLowerCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Target Agency: </span>
                            {isMock ? `Ward Division ${complaint.location.city === "Bangalore" ? "BBMP" : "BMC"}` : routeLog ? (routeLog.output?.department || "General Municipal Office") : "Awaiting..."}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Officer Assigned: </span>
                            {isMock ? `Ward Inspector ${complaint.location.city === "Bangalore" ? "BBMP-86" : "BMC-42"}` : routeLog ? (routeLog.output?.reasoning || "Auto-routed") : "Awaiting..."}
                          </div>
                        </div>
                      </div>

                      {/* Complaint Audit */}
                      <div className="p-4 rounded-sm border border-border bg-background/50 space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                          <FileSpreadsheet className="w-4 h-4 text-info" />
                          <span>Complaint Auditor</span>
                        </div>
                        <div className="text-xs space-y-1 text-muted">
                          <div>
                            <span className="font-semibold text-foreground">Submission Code: </span>
                            {complaint.id}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">API Sync: </span>
                            Successful
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Auto-Grievance: </span>
                            {isMock ? "Filed" : reportLog ? "Filed" : "Awaiting..."}
                          </div>
                        </div>
                      </div>

                      {/* Generated official letter draft */}
                      <div className="col-span-1 md:col-span-2 p-4 rounded-sm border border-border bg-background/50 space-y-2">
                        <div className="font-semibold text-sm text-foreground border-b border-border/40 pb-2">Auto-Drafted Formal Complaint Letter</div>
                        {isMock ? (
                          <p className="text-xs font-mono text-muted border border-border/40 p-3 rounded-sm bg-background leading-relaxed select-all">
                            To,<br />
                            The Ward Grievance Officer,<br />
                            Municipal Corporation of {complaint.location.city}<br /><br />
                            SUBJECT: Grievance regarding {complaint.category} at {complaint.location.address}.<br /><br />
                            This is an official grievance report regarding a serious {complaint.category} anomaly at {complaint.location.address}. The issue has been registered with ID {complaint.id} under Jaagruk Civic Shield rules. Visual validation confirms safety violation parameters. Request immediate dispatch and correction.<br /><br />
                            Sincerely,<br />
                            Jaagruk Civic Agent (on behalf of {complaint.reportedBy.name})
                          </p>
                        ) : reportLog ? (
                          <p className="text-xs font-mono text-muted border border-border/40 p-3 rounded-sm bg-background leading-relaxed select-all whitespace-pre-wrap">
                            {reportLog.output?.letter}
                          </p>
                        ) : (
                          <p className="text-xs font-mono text-muted border border-border/40 p-3 rounded-sm bg-background leading-relaxed select-none animate-pulse">
                            Awaiting grievance draft from Reporter Agent...
                          </p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Agent Process Timeline */}
        <div className="space-y-8">
          <div className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">AI Process Pipeline</h3>
              <p className="text-xs text-muted mt-1">Multi-agent verification and registration status.</p>
            </div>

            <div className="space-y-4">
              {getAgentSteps().map((step) => (
                <AgentStepCard
                  key={step.agentName}
                  agentName={step.agentName}
                  stageTitle={step.stageTitle}
                  status={step.status}
                  reasoning={step.reasoning}
                  timestamp={step.timestamp}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-md shadow-lg border ${
              toastType === "success" 
                ? "bg-success/15 border-success text-success" 
                : "bg-error/15 border-error text-error"
            }`}
          >
            {toastType === "success" ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <AlertCircle className="w-5 h-5 text-error" />
            )}
            <span className="text-sm font-medium">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-muted hover:text-foreground text-lg focus:outline-none"
              aria-label="Dismiss toast"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
