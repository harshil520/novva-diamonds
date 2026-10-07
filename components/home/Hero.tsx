"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search } from "lucide-react";
import DiamondCanvas, { type DiamondCanvasHandle } from "@/components/three/DiamondCanvas";
import { TextReveal } from "@/components/ui/Reveal";
import { ButtonLink, ArrowGlyph } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import CountUp from "@/components/ui/CountUp";
import { useUI } from "@/components/providers/UIProvider";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import { onIntroDone } from "@/lib/intro";
import { EASE_LUXE } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const METRICS = [
  { value: 90, suffix: "%+", label: "of the world’s diamonds are cut in Surat" },
  { value: 100, suffix: "%", label: "GIA & IGI certified, laser-inscribed" },
  { value: 10, suffix: "", label: "master-cut silhouettes in stock" },
  { value: 3, suffix: "–5 days", label: "insured, armoured delivery worldwide" },
];

export default function Hero() {
  const { openSearch } = useUI();
  const [ready, setReady] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stoneRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const diamond = useRef<DiamondCanvasHandle>(null);

  useEffect(() => onIntroDone(() => setReady(true)), []);

  // Scroll choreography: the stone turns and drifts as the hero leaves the screen
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => diamond.current?.setExtraSpin(self.progress * Math.PI * 1.25),
      });
      gsap.to(stoneRef.current, {
        yPercent: 18,
        scale: 0.9,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(copyRef.current, {
        yPercent: -14,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-[72px]">
      {/* Studio light behind the stone */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10%] top-[2%] h-[90vh] w-[90vh] rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.95),rgb(255_255_255/0)_75%)] max-lg:left-1/2 max-lg:-translate-x-1/2 max-lg:top-[-8%] max-lg:h-[70vh] max-lg:w-[70vh]" />
      </div>

      <div className="shell relative grid min-h-[calc(100svh-72px)] grid-rows-[auto_1fr_auto] lg:grid-cols-12 lg:grid-rows-[1fr_auto]">
        {/* Stone */}
        <div ref={stoneRef} className="relative h-[44svh] min-h-[300px] lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:h-auto">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={ready ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.8, ease: EASE_LUXE, delay: 0.2 }}
          >
            <DiamondCanvas
              ref={diamond}
              shape="Round"
              priority
              interactive
              followPointer
              autoRotate={0.28}
              tilt={0.82}
              fill={0.66}
              ariaLabel="A round brilliant diamond rendered in real time. Drag to rotate."
            />
          </motion.div>
          {/* contact shadow */}
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[22%] left-1/2 h-6 w-[34%] -translate-x-1/2 rounded-[50%] bg-ink/[0.08] blur-xl" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ delay: 1.4, duration: 1 }}
            className="pointer-events-none absolute inset-0 hidden text-[10.5px] uppercase tracking-[0.18em] text-mute lg:block"
          >
            <span className="absolute left-[0%] top-[16%] flex items-center gap-3">
              Refractive index 2.417 <span className="h-px w-14 bg-line-strong" />
            </span>
            <span className="absolute bottom-[18%] right-[0%] flex items-center gap-3">
              <span className="h-px w-14 bg-line-strong" /> 57 facets · Round brilliant
            </span>
            <span className="absolute bottom-[6%] left-1/2 -translate-x-1/2 normal-case tracking-[0.04em]">Drag to turn the stone</span>
          </motion.div>
        </div>

        {/* Copy */}
        <div ref={copyRef} className="relative z-10 flex flex-col justify-center pb-10 lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:pb-0">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE_LUXE }}
          >
            Private diamond house · Surat, India
          </motion.p>
          <TextReveal
            as="h1"
            play={ready}
            delay={0.1}
            segments={["Certified\n", { em: "brilliance," }, "\ndelivered worldwide."]}
            className="display mt-5 text-[clamp(2.8rem,6.1vw,6.1rem)] leading-[0.95] tracking-[-0.035em]"
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.75, ease: EASE_LUXE }}
          >
            <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-ink-soft/85">
              Natural and lab-grown diamonds, selected on the bourse floor and certified by GIA or IGI — offered
              directly to private clients and jewellers, without the layers in between.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/diamonds" size="lg">
                View the collection <ArrowGlyph />
              </ButtonLink>
              <ButtonLink href={getConciergeWhatsAppUrl({ topic: "general" })} variant="outline" size="lg">
                <WhatsAppIcon size={16} /> Speak to a specialist
              </ButtonLink>
            </div>
            <button
              type="button"
              onClick={openSearch}
              className="group mt-7 flex w-full max-w-md items-center gap-3 border-b border-line-strong pb-3 text-left text-[13.5px] text-mute transition-colors hover:border-ink hover:text-ink"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
              <span className="flex-1">Find a stone by ID, certificate or carat</span>
              <kbd className="hidden rounded border border-line px-1.5 text-[10px] sm:inline">⌘K</kbd>
            </button>
          </motion.div>
        </div>

        {/* Metrics */}
        <motion.dl
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 1.1, duration: 1 }}
          className="relative z-10 grid grid-cols-2 border-t border-line lg:col-span-12 lg:grid-cols-4"
        >
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className={`py-5 pr-4 sm:py-6 ${i % 2 === 1 ? "pl-4 max-lg:border-l max-lg:border-line" : ""} ${i > 0 ? "lg:border-l lg:border-line lg:pl-8" : ""} ${i > 1 ? "max-lg:border-t max-lg:border-line" : ""}`}
            >
              <dt className="sr-only">{m.label}</dt>
              <dd>
                <span className="display numeric text-[2rem] sm:text-[2.6rem]">
                  <CountUp to={m.value} />
                  <span className="text-[0.6em] tracking-normal">{m.suffix}</span>
                </span>
                <span className="mt-1.5 block max-w-[15rem] text-[12px] leading-snug text-mute sm:text-[12.5px]">{m.label}</span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
