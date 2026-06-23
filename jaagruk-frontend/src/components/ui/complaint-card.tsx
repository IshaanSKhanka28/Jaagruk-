"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, ThumbsUp, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Complaint, CATEGORY_META, getTimeAgo } from "@/lib/mock-data";

interface ComplaintCardProps {
  complaint: Complaint;
  index?: number;
}

export function ComplaintCard({ complaint, index = 0 }: ComplaintCardProps) {
  const categoryMeta = CATEGORY_META[complaint.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        href={`/report/${complaint.id}`}
        className="group block rounded-[var(--radius-md)] border border-border bg-surface p-4 transition-all hover:border-border-hover hover:bg-surface-raised"
        style={{
          boxShadow: "var(--shadow-sm)",
          transitionDuration: "var(--duration-fast)",
          transitionTimingFunction: "var(--ease-out)",
        }}
        id={`complaint-card-${complaint.id}`}
      >
        <div className="flex gap-4">
          {/* Photo thumbnail */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-surface">
            <img
              src={complaint.imageUrl}
              alt={complaint.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base flex-shrink-0" role="img" aria-label={categoryMeta.label}>
                  {categoryMeta.icon}
                </span>
                <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {complaint.title}
                </h3>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {complaint.location.address.length > 30
                  ? complaint.location.address.substring(0, 30) + "…"
                  : complaint.location.address}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getTimeAgo(complaint.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-xs text-muted">
                <ThumbsUp className="w-3 h-3" />
                {complaint.upvotes}
              </span>
              <span className="text-xs text-muted">·</span>
              <span className="text-xs font-mono text-muted">{complaint.id}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
