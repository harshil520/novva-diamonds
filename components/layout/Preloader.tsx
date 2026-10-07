"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { markIntroDone } from "@/lib/intro";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * First-visit curtain: the wordmark rises letter by letter while a hairline
 * measures progress, then the curtain lifts. Shown once per session, skipped
 * for reduced-motion visitors, and never blocks content underneath.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useIsoLayoutEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("novva_intro") === "1";
      sessionStorage.setItem("novva_intro", "1");
    } catch {
      /* storage unavailable */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce || !root.current) {
      setDone(true);
      markIntroDone();
      return;
    }
    document.documentElement.dataset.intro = "playing";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          delete document.documentElement.dataset.intro;
          setDone(true);
        },
      });
      tl.from("[data-letter]", { yPercent: 110, duration: 1.1, stagger: 0.06 })
        .from("[data-sub]", { opacity: 0, y: 8, duration: 0.8 }, "-=0.7")
        .to("[data-bar]", { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.2)
        .add(markIntroDone, "+=0.05")
        .to("[data-letter]", { yPercent: -110, duration: 0.7, stagger: 0.035, ease: "expo.in" }, "<")
        .to("[data-sub], [data-bar]", { opacity: 0, duration: 0.3 }, "<")
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "-=0.35");
    }, root);
    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="novva-preloader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ivory"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div className="flex overflow-hidden font-display font-extralight text-[13vw] leading-none tracking-[0.2em] text-ink sm:text-[8vw]">
        {"NOVVA".split("").map((l, i) => (
          <span key={i} data-letter className="inline-block">
            {l}
          </span>
        ))}
      </div>
      <p data-sub className="eyebrow mt-6">
        Certified brilliance · Surat
      </p>
      <div className="mt-10 h-px w-40 overflow-hidden bg-line">
        <div data-bar className="h-full w-full origin-left scale-x-0 bg-ink" />
      </div>
    </div>
  );
}
