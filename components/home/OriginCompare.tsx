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
    title: "Natural",
    body: "Formed deep in the earth over billions of years. Rare, and the classic choice.",
    points: ["Certified by GIA", "Holds its value well"],
    href: "/diamonds?origin=Natural",
    cta: "See natural diamonds",
  },
  {
    key: "lab",
    title: "Lab-grown",
    body: "Grown in a lab. The same material, hardness and sparkle as a natural diamond.",
    points: ["Certified by IGI", "Bigger size for your budget"],
    href: "/diamonds?origin=Lab-Grown",
    cta: "See lab-grown diamonds",
  },
];

export default function OriginCompare() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <section className="border-t border-line py-24 sm:py-32" aria-label="Natural and lab-grown diamonds">
      <div className="shell">
        <SectionIntro
          title={["Natural or", { em: "lab-grown?" }]}
          description="Both are real diamonds. Each comes with its own certificate."
        />

        <div className="mt-14 flex flex-col gap-4 sm:mt-20 lg:flex-row" onMouseLeave={() => setHover(null)}>
          {SIDES.map((s, i) => (
            <motion.div
              key={s.key}
              onMouseEnter={() => setHover(s.key)}
              animate={{ flexGrow: hover === null ? 1 : hover === s.key ? 1.25 : 0.9 }}
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
                  <h3 className="display text-[3rem] leading-none sm:text-[4rem]">{s.title}</h3>
                  <p className={cn("mt-6 max-w-md text-[15px] leading-relaxed", hover === s.key ? "text-ivory/75" : "text-mute")}>{s.body}</p>
                  <ul className={cn("mt-8 space-y-3 border-t pt-6", hover === s.key ? "border-ivory/15" : "border-line")}>
                    {s.points.map((p) => (
                      <li key={p} className="text-[14px] font-medium">
                        {p}
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
