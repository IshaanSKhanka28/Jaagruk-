"use client";

import { motion, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  suffix?: string;
  color?: string;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      className="tabular-nums"
    >
      {isInView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CountUp target={value} />
          {suffix}
        </motion.span>
      ) : (
        "0"
      )}
    </motion.span>
  );
}

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isInView && !hasStartedRef.current) {
      hasStartedRef.current = true;
      const duration = 1500; // 1.5 seconds
      const intervalTime = 30; // 30ms step
      const totalSteps = duration / intervalTime;
      const stepIncrement = target / totalSteps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= totalSteps) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.round(currentStep * stepIncrement));
        }
      }, intervalTime);

      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return <span ref={ref}>{isInView ? count.toLocaleString("en-IN") : "0"}</span>;
}

export function StatCard({ icon: Icon, value, label, suffix = "", color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
      className="flex flex-col gap-3 p-5 rounded-[var(--radius-md)] bg-surface border border-border"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center"
        style={{ backgroundColor: color || "var(--color-primary-subtle)" }}
      >
        <Icon className="w-5 h-5" style={{ color: color || "var(--color-primary)" }} />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          <AnimatedNumber value={value} suffix={suffix} />
        </p>
        <p className="text-sm text-muted mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}
