"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    // Transition loading state after 3.3 seconds (fades out from 2.9s to 3.3s)
    const timer = setTimeout(() => {
      onComplete();
    }, 3300);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const letters = Array.from("Jaagruk");

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.9, duration: 0.4, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090B] text-white"
    >
      <div className="flex flex-col items-center gap-6">
        <svg
          width="160"
          height="160"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="loading-skyline-clip">
              <circle cx="14" cy="14" r="4.5" />
            </clipPath>
          </defs>

          {/* Eye lens outline shape (stroke-width: 2px) */}
          <motion.path
            d="M 2,14 C 6,4 22,4 26,14 C 22,24 6,24 2,14 Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeInOut" }}
          />

          {/* Outer Iris scales in (800ms) */}
          <motion.circle
            cx="14"
            cy="14"
            r="7.5"
            stroke="#3B82F6"
            strokeWidth="1"
            fill="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: "14px 14px" }}
            transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
          />

          {/* Inner Iris scales in (900ms) */}
          <motion.circle
            cx="14"
            cy="14"
            r="5.5"
            stroke="#3B82F6"
            strokeWidth="0.8"
            fill="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: "14px 14px" }}
            transition={{ delay: 0.9, duration: 0.4, ease: "easeOut" }}
          />

          {/* Pupil fades in (1100ms) */}
          <motion.circle
            cx="14"
            cy="14"
            r="4.5"
            fill="#1E3A8A"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.3 }}
          />

          {/* City skyline bars rise up inside pupil (1300ms + 80ms stagger) */}
          <g clipPath="url(#loading-skyline-clip)">
            {/* Bar 1 */}
            <motion.rect
              x="10.5"
              width="1"
              fill="white"
              initial={{ y: 20, height: 0 }}
              animate={{ y: 13, height: 6 }}
              transition={{ delay: 1.3, duration: 0.3, ease: "easeOut" }}
            />
            {/* Bar 2 */}
            <motion.rect
              x="12"
              width="1"
              fill="white"
              initial={{ y: 20, height: 0 }}
              animate={{ y: 11, height: 8 }}
              transition={{ delay: 1.38, duration: 0.3, ease: "easeOut" }}
            />
            {/* Bar 3 */}
            <motion.rect
              x="13.5"
              width="1"
              fill="white"
              initial={{ y: 20, height: 0 }}
              animate={{ y: 12, height: 7 }}
              transition={{ delay: 1.46, duration: 0.3, ease: "easeOut" }}
            />
            {/* Bar 4 */}
            <motion.rect
              x="15"
              width="1"
              fill="white"
              initial={{ y: 20, height: 0 }}
              animate={{ y: 10, height: 9 }}
              transition={{ delay: 1.54, duration: 0.3, ease: "easeOut" }}
            />
            {/* Bar 5 */}
            <motion.rect
              x="16.5"
              width="1"
              fill="white"
              initial={{ y: 20, height: 0 }}
              animate={{ y: 13, height: 6 }}
              transition={{ delay: 1.62, duration: 0.3, ease: "easeOut" }}
            />
          </g>

          {/* Orange alert dot pops in with keyframe bounce (1700ms) */}
          <motion.circle
            cx="24"
            cy="9"
            fill="#F97316"
            initial={{ r: 0 }}
            animate={{ r: [0, 5, 4] }}
            transition={{ delay: 1.7, duration: 0.45, ease: "easeOut" }}
          />
        </svg>

        {/* Wordmark typewriter effect (2000ms + 80ms/letter) */}
        <div
          className="font-sans font-extrabold tracking-tight text-white text-3xl select-none flex h-9"
          style={{ letterSpacing: "-0.05em" }}
        >
          {letters.map((letter, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0 + idx * 0.08, duration: 0.08 }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Tagline fade in (2600ms) */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.4, ease: "easeOut" }}
          className="font-mono font-bold tracking-widest text-[#F97316] text-xs uppercase"
        >
          SEE IT. REPORT IT. FIX IT.
        </motion.p>
      </div>
    </motion.div>
  );
}
