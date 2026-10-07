"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_LUXE } from "@/lib/motion";

/** Every navigation fades the incoming page up from beneath the header. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_LUXE }}
    >
      {children}
    </motion.div>
  );
}
