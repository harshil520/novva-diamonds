"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Fades and lifts its children into place the first time they enter the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
  amount = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span" | "p";
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1, delay, ease: EASE_LUXE }}
    >
      {children}
    </Comp>
  );
}

/**
 * Editorial headline reveal: every word rises out of its own mask.
 * Wrap words in <em> by passing segments: ["Certified", { em: "brilliance" }].
 */
type Segment = string | { em: string };

export function TextReveal({
  segments,
  className,
  delay = 0,
  as = "h2",
  immediate = false,
  play,
  stagger = 0.06,
}: {
  segments: Segment[];
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
  immediate?: boolean;
  /** When provided, the reveal is driven by this flag instead of viewport entry */
  play?: boolean;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const words: { text: string; em: boolean; br: boolean }[] = [];
  segments.forEach((seg) => {
    const text = typeof seg === "string" ? seg : seg.em;
    const em = typeof seg !== "string";
    text.split(/(\n)/).forEach((part) => {
      if (part === "\n") {
        words.push({ text: "", em, br: true });
        return;
      }
      part
        .split(" ")
        .filter(Boolean)
        .forEach((w) => words.push({ text: w, em, br: false }));
    });
  });

  const Comp = motion[as];
  const animateProps =
    play !== undefined
      ? { initial: "hidden", animate: play ? "visible" : "hidden" }
      : immediate
      ? { initial: "hidden", animate: "visible" }
      : { initial: "hidden", whileInView: "visible", viewport: { once: true, amount: 0.4 } };

  let index = 0;
  return (
    <Comp className={cn(className)} {...(reduce ? {} : animateProps)}>
      {words.map((w, i) => {
        if (w.br) return <br key={`br-${i}`} />;
        const my = index++;
        return (
          <React.Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
              <motion.span
                className={cn("inline-block", w.em && "accent")}
                variants={{
                  hidden: { y: "105%", rotate: 2 },
                  visible: {
                    y: "0%",
                    rotate: 0,
                    transition: { duration: 1.1, delay: delay + my * stagger, ease: EASE_LUXE },
                  },
                }}
              >
                {w.text}
              </motion.span>
            </span>{" "}
          </React.Fragment>
        );
      })}
    </Comp>
  );
}
