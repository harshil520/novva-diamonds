"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import SectionIntro from "@/components/ui/SectionIntro";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowGlyph } from "@/components/ui/Button";
import { FacetMark } from "@/components/ui/icons";
import { EASE_LUXE } from "@/lib/motion";

const ROWS = [
  ["Carat weight", "1.22 ct"],
  ["Shape & cut", "Round brilliant"],
  ["Colour grade", "D · Colourless"],
  ["Clarity grade", "VVS1"],
  ["Cut grade", "Excellent"],
  ["Polish / Symmetry", "Excellent / Excellent"],
];

export default function Certification() {
  return (
    <section className="border-t border-line py-24 sm:py-32" aria-label="Certification">
      <div className="shell grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <SectionIntro
            align="left"
            eyebrow="Independent certification"
            title={["Graded by others.", { em: "Inscribed" }, "for good."]}
          />
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-md text-[15px] leading-relaxed text-mute">
              Every stone carries an original, independently verifiable report from GIA or IGI — never a seller’s own
              certificate.
            </p>
          </Reveal>
          <dl className="mt-10 space-y-0">
            {[
              [
                "Microscopic laser inscription",
                "The report number is engraved on the girdle — invisible to the eye, readable under a 10× loupe.",
              ],
              [
                "Direct registry check",
                "Every listing links to the official GIA Report Check or IGI Verify portal so you can confirm it yourself.",
              ],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={0.15 + i * 0.08} className="border-t border-line py-5 last:border-b">
                <dt className="text-[14.5px] font-medium">{t}</dt>
                <dd className="mt-1.5 text-[14px] leading-relaxed text-mute">{d}</dd>
              </Reveal>
            ))}
          </dl>
          <Reveal delay={0.3}>
            <Link href="/education/certification" className="group mt-8 inline-flex items-center gap-2 text-[13.5px] font-medium">
              <span className="link-draw">Read the verification guide</span> <ArrowGlyph />
            </Link>
          </Reveal>
        </div>

        {/* Specimen report */}
        <div className="lg:col-span-6 lg:col-start-7">
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.2 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.4, ease: EASE_LUXE }}
            className="relative mx-auto max-w-[540px] rounded-[6px] border border-line bg-paper p-7 shadow-[0_50px_100px_-50px_rgb(18_18_18/0.35)] sm:p-10"
          >
            <div className="flex items-start justify-between border-b border-ink pb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mute">Specimen</p>
                <p className="display mt-2 text-[1.6rem] leading-none sm:text-[1.9rem]">Diamond Grading Report</p>
              </div>
              <FacetMark size={30} className="text-ink" />
            </div>
            <div className="flex justify-between border-b border-line py-3 text-[11.5px]">
              <span className="text-mute">Report no.</span>
              <span className="numeric tracking-[0.12em]">GIA 2487319402</span>
            </div>
            <dl className="mt-2">
              {ROWS.map(([k, v], i) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.5 + i * 0.08, ease: EASE_LUXE }}
                  className="flex items-baseline justify-between gap-4 border-b border-dotted border-line-strong py-3"
                >
                  <dt className="text-[12.5px] text-mute">{k}</dt>
                  <dd className="text-[14px] font-medium">{v}</dd>
                </motion.div>
              ))}
            </dl>

            {/* Laser inscription with a scanning beam */}
            <div className="relative mt-7 overflow-hidden rounded-full border border-line bg-ivory px-5 py-3">
              <p className="numeric text-center text-[11px] tracking-[0.45em] text-ink-soft">GIA 2487319402</p>
              <motion.span
                aria-hidden="true"
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-ink/15 to-transparent"
                initial={{ left: "-20%" }}
                animate={{ left: "110%" }}
                transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
              />
            </div>
            <p className="mt-3 text-center text-[11px] text-mute">Girdle inscription · verified</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
