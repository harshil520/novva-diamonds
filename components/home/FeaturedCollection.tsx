"use client";

import React from "react";
import { motion } from "motion/react";
import DiamondCard from "@/components/diamond/DiamondCard";
import SectionIntro from "@/components/ui/SectionIntro";
import { ButtonLink, ArrowGlyph } from "@/components/ui/Button";
import { diamondsData } from "@/data/diamonds";
import { EASE_LUXE } from "@/lib/motion";

export default function FeaturedCollection() {
  const featured = diamondsData.filter((d) => d.featured).slice(0, 6);

  return (
    <section className="border-t border-line py-24 sm:py-32" aria-label="Private selection">
      <div className="shell">
        <SectionIntro
          eyebrow="The private selection"
          title={["Stones we would", { em: "set ourselves." }]}
          description="Hand-picked from the vault for cut precision, eye-clean clarity and crisp transparency. Natural and lab-grown, all independently graded."
          action={{ label: `View all ${diamondsData.length} stones`, href: "/diamonds" }}
        />

        <motion.div
          className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 sm:mt-20 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {featured.map((d, i) => (
            <motion.div
              key={d.id}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE_LUXE } },
              }}
              className={i % 3 === 1 ? "lg:translate-y-12" : ""}
            >
              <DiamondCard diamond={d} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 flex justify-center sm:mt-24">
          <ButtonLink href="/diamonds" variant="outline" size="lg">
            Open the full collection <ArrowGlyph />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
