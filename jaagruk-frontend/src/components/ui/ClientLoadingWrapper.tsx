"use client";

import React, { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AnimatePresence } from "framer-motion";

export function ClientLoadingWrapper({ children }: { children: React.ReactNode }) {
  const [showLoading, setShowLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const seen = localStorage.getItem("jaagruk_seen");
    if (!seen) {
      setShowLoading(true);
      localStorage.setItem("jaagruk_seen", "true");
    }
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoading && (
          <LoadingScreen key="loader" onComplete={() => setShowLoading(false)} />
        )}
      </AnimatePresence>
      {/* Render children. We keep them visible underneath but blocked by the fixed loading overlay */}
      {children}
    </>
  );
}
