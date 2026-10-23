"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import DiamondCanvas from "@/components/three/DiamondCanvas";
import DiamondPhoto from "@/components/diamond/DiamondPhoto";
import { TextReveal, Reveal } from "@/components/ui/Reveal";
import { ArrowGlyph } from "@/components/ui/Button";
import { allDiamondShapes, diamondsData } from "@/data/diamonds";
import { SHAPE_PROFILES } from "@/lib/shapes";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DiamondShape } from "@/types/diamond";

const CYCLE_MS = 5000;

export default function ShapeExplorer() {
  const [active, setActive] = useState<DiamondShape>("Round");
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const stripRef = useRef<HTMLDivElement>(null);

  const counts = Object.fromEntries(
    allDiamondShapes.map((s) => [s, diamondsData.filter((d) => d.shape === s).length])
  ) as Record<DiamondShape, number>;

  // Gentle auto-tour through the cuts until the visitor takes over
  useEffect(() => {
    if (paused || !inView) return;
    const t = window.setTimeout(() => {
      const i = allDiamondShapes.indexOf(active);
      setActive(allDiamondShapes[(i + 1) % allDiamondShapes.length]);
    }, CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, inView]);

  // Warm every cut's geometry once the section is near, so switching is instant
  useEffect(() => {
    if (!inView) return;
    import("@/lib/three/bridge")
      .then(({ prefetchModels }) => prefetchModels(Object.values(SHAPE_PROFILES).map((p) => p.model)))
      .catch(() => undefined);
  }, [inView]);

  // Keep the active chip visible on the mobile strip
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-shape="${active}"]`);
    if (el && stripRef.current) {
      stripRef.current.scrollTo({ left: el.offsetLeft - stripRef.current.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
    }
  }, [active]);

  const choose = (s: DiamondShape) => {
    setPaused(true);
    setActive(s);
  };

  const profile = SHAPE_PROFILES[active];

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32" aria-label="Explore by shape">
      <div className="shell">
        <TextReveal segments={["Shop by", { em: "shape" }]} className="display text-[clamp(2.4rem,5vw,4.6rem)] leading-[1]" />

        {/* Mobile shape strip */}
        <div ref={stripRef} className="no-scrollbar -mx-5 mt-12 flex gap-2 overflow-x-auto px-5 lg:hidden" role="tablist" aria-label="Diamond shapes">
          {allDiamondShapes.map((s) => (
            <button
              key={s}
              data-shape={s}
              role="tab"
              aria-selected={active === s}
              onClick={() => choose(s)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-[13px] transition-colors duration-300",
                active === s ? "border-ink bg-ink text-ivory" : "border-line text-ink-soft"
              )}
            >
              <span className={cn("h-7 w-7 rounded-full p-1", active === s ? "bg-ivory" : "bg-porcelain")}>
                <DiamondPhoto shape={s} alt="" sizes="28px" />
              </span>
              {s}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          {/* Desktop list */}
          <div className="hidden lg:col-span-4 lg:block" role="tablist" aria-label="Diamond shapes" aria-orientation="vertical">
            <ul className="border-t border-line">
              {allDiamondShapes.map((s) => {
                const on = active === s;
                return (
                  <li key={s} className="relative border-b border-line">
                    <button
                      role="tab"
                      aria-selected={on}
                      onClick={() => choose(s)}
                      onMouseEnter={() => choose(s)}
                      onFocus={() => choose(s)}
                      className="group flex w-full items-center gap-5 py-[0.9rem] text-left"
                    >
                      <span
                        className={cn(
                          "display flex-1 text-[1.75rem] leading-none transition-all duration-500 ease-[var(--ease-luxe)]",
                          on ? "translate-x-1 font-normal text-ink" : "text-ink/35 group-hover:text-ink/70"
                        )}
                      >
                        {s}
                      </span>
                      <span className={cn("text-[12px] transition-colors", on ? "text-ink-soft" : "text-faint")}>
                        {counts[s]}
                      </span>
                    </button>
                    {on && !paused && inView && (
                      <motion.span
                        key={`${s}-progress`}
                        className="absolute bottom-[-1px] left-0 h-px origin-left bg-ink"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                        style={{ width: "100%" }}
                      />
                    )}
                    {on && (paused || !inView) && <span className="absolute bottom-[-1px] left-0 h-px w-full bg-ink" />}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Stage */}
          <div className="relative lg:col-span-8">
            <div className="relative aspect-[4/3.4] overflow-hidden rounded-[28px] bg-porcelain sm:aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[560px]">
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_45%,rgb(255_255_255/0.95),transparent_75%)]" />
              <div aria-hidden="true" className="absolute bottom-[24%] left-1/2 h-5 w-[26%] -translate-x-1/2 rounded-[50%] bg-ink/[0.09] blur-xl" />
              <div className="absolute inset-0" onPointerDown={() => setPaused(true)}>
                <DiamondCanvas shape={active} interactive autoRotate={0.45} tilt={0.68} fill={0.62} ariaLabel={`${active} cut diamond, drag to rotate`} />
              </div>

              <div className="pointer-events-none absolute left-5 top-5 sm:left-8 sm:top-7">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={active}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.5, ease: EASE_LUXE }}
                    className="display text-[2.2rem] leading-none sm:text-[3rem]"
                  >
                    {active}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p className="pointer-events-none absolute right-5 top-6 text-[11px] text-mute sm:right-8 sm:top-8">Drag to rotate</p>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE_LUXE }}
                >
                  <p className="max-w-lg text-[15px] leading-relaxed text-ink-soft">{profile.character}</p>
                  <p className="mt-3 flex gap-5 text-[12px] text-mute">
                    <span>Ratio {profile.ratio}</span>
                    <span>{profile.facets}</span>
                  </p>
                </motion.div>
              </AnimatePresence>
              <Link
                href={`/diamonds?shape=${active}`}
                className="group inline-flex items-center gap-3 self-end rounded-full border border-ink/20 py-2.5 pl-5 pr-2.5 text-[13.5px] font-medium transition-colors duration-500 hover:border-ink hover:bg-ink hover:text-ivory"
              >
                {counts[active] ? `View ${active} diamonds` : `Ask for a ${active}`}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-ivory transition-colors group-hover:bg-ivory group-hover:text-ink">
                  <ArrowGlyph />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
