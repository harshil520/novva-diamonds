"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import SectionIntro from "@/components/ui/SectionIntro";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowGlyph } from "@/components/ui/Button";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SIDES = [
  {
    key: "natural",
    eyebrow: "Earth-mined rarity",
    title: "Natural",
    body: "Formed one to three billion years ago in the Earth’s mantle. Each is a finite, unrepeatable geological event.",
    points: [
      ["Billion-year provenance", "Inherent rarity from a finite natural supply."],
      ["GIA premier grading", "Graded by the Gemological Institute of America, laser-registered."],
      ["Enduring position", "The choice for heirlooms, engagements and collections."],
    ],
    href: "/diamonds?origin=Natural",
    cta: "Explore natural diamonds",
  },
  {
    key: "lab",
    eyebrow: "Advanced engineering",
    title: "Lab-grown",
    body: "Grown by CVD or HPHT. Chemically, physically and optically identical to a mined diamond — not a simulant.",
    points: [
      ["Type IIa purity", "Virtually nitrogen-free, the purity class of the rarest 2% of mined stones."],
      ["IGI / GIA certified", "Microscopic inscription records origin and grade."],
      ["Scale within reach", "Larger, statement carat weights at attainable budgets."],
    ],
    href: "/diamonds?origin=Lab-Grown",
    cta: "Explore lab-grown diamonds",
  },
];

export default function OriginCompare() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <section className="border-t border-line py-24 sm:py-32" aria-label="Natural and lab-grown diamonds">
      <div className="shell">
        <SectionIntro
          eyebrow="Two origins, one crystal"
          title={["Natural or", { em: "lab-grown." }, "Both, honestly."]}
          description="Identical pure carbon lattice, hardness 10 on the Mohs scale and refractive index 2.417. We stock both and keep them strictly segregated and separately certified."
        />

        <Reveal className="mt-14 flex flex-wrap gap-x-8 gap-y-2 border-y border-line py-4 text-[12.5px] text-mute sm:mt-20">
          <span className="text-ink">Identical in</span>
          <span>100% crystallised carbon</span>
          <span>Mohs hardness 10</span>
          <span>Refractive index 2.417</span>
          <span>Density 3.52 g/cm³</span>
        </Reveal>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row" onMouseLeave={() => setHover(null)}>
          {SIDES.map((s, i) => (
            <motion.div
              key={s.key}
              onMouseEnter={() => setHover(s.key)}
              animate={{ flexGrow: hover === null ? 1 : hover === s.key ? 1.35 : 0.85 }}
              transition={{ duration: 0.9, ease: EASE_LUXE }}
              className="basis-0 lg:min-w-0"
              style={{ flexGrow: 1 }}
            >
              <Reveal delay={i * 0.1} className="h-full">
                <div
                  className={cn(
                    "flex h-full flex-col rounded-[28px] border p-7 transition-colors duration-700 sm:p-10",
                    hover === s.key ? "border-ink bg-ink text-ivory" : "border-line bg-paper"
                  )}
                >
                  <p className={cn("eyebrow", hover === s.key && "text-ivory/60")}>{s.eyebrow}</p>
                  <h3 className="display mt-4 text-[3rem] leading-none sm:text-[4rem]">{s.title}</h3>
                  <p className={cn("mt-6 max-w-md text-[15px] leading-relaxed", hover === s.key ? "text-ivory/75" : "text-mute")}>{s.body}</p>
                  <ul className={cn("mt-8 space-y-4 border-t pt-6", hover === s.key ? "border-ivory/15" : "border-line")}>
                    {s.points.map(([t, d]) => (
                      <li key={t} className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-4">
                        <span className="text-[13.5px] font-medium">{t}</span>
                        <span className={cn("text-[13.5px] leading-relaxed", hover === s.key ? "text-ivory/65" : "text-mute")}>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={s.href} className="group mt-auto inline-flex items-center gap-2 pt-10 text-[13.5px] font-medium">
                    <span className="link-draw">{s.cta}</span> <ArrowGlyph />
                  </Link>
                </div>
              </Reveal>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
