"use client";

import React from "react";
import SectionIntro from "@/components/ui/SectionIntro";
import { Reveal } from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import { siteConfig } from "@/config/config";
import RouteGlobe from "@/components/three/RouteGlobe";
import RouteMap from "./RouteMap";

const PILLARS = [
  {
    title: "Direct-from-source pricing",
    body: "Bought straight from Surat cutting houses, our clients typically save 20–35% against multi-tier brokerage in Antwerp or New York.",
  },
  {
    title: "A specialist, not a cart",
    body: "You speak with one diamond professional who examines every stone under the loupe and measures each facet before it ships.",
  },
  {
    title: "Armoured, fully insured transit",
    body: "Brink’s, Malca-Amit or Ferrari Express carry every parcel at full declared value, under tamper-evident serial seals.",
  },
];

export default function Provenance() {
  return (
    <section className="relative border-t border-line bg-paper/50 py-24 sm:py-32" aria-label="Provenance and delivery">
      <div className="shell">
        <SectionIntro
          eyebrow="The source"
          title={["From Surat.", { em: "Connected" }, "to the world."]}
          description="Novva works inside the Surat Diamond Bourse — the largest diamond trading complex on earth — so provenance is transparent and the markup simply isn’t there."
        />

        <div className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <p className="display numeric text-[clamp(5rem,12vw,10rem)] leading-[0.85] tracking-[-0.04em]">
              <CountUp to={90} duration={2.4} />
              <span className="text-[0.45em] align-top">%</span>
            </p>
            <p className="mt-5 max-w-xs text-[14.5px] leading-relaxed text-mute">
              of the world’s rough diamonds are cut and polished in Surat by master craftsmen and laser planners.
            </p>
          </Reveal>

          <ol className="lg:col-span-7 lg:col-start-6">
            {PILLARS.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.08} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-line py-7 last:border-b sm:grid-cols-[4rem_1fr_1.3fr] sm:gap-6">
                <span className="numeric pt-1 text-[12px] text-faint">0{i + 1}</span>
                <h3 className="display text-[1.5rem] leading-tight sm:text-[1.65rem]">{p.title}</h3>
                <p className="col-start-2 text-[14px] leading-relaxed text-mute sm:col-start-3">{p.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Delivery corridors */}
        <div className="mt-24 sm:mt-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Secured delivery corridors</p>
              <p className="display mt-3 text-[1.9rem] sm:text-[2.4rem]">Door to door in 3–5 business days.</p>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-mute">{siteConfig.shipping.insuredCourier}</p>
          </div>

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="relative lg:col-span-7">
              <RouteGlobe className="mx-auto max-w-[620px]" fallback={<RouteMap />} />
              <p className="mt-2 text-center text-[11px] text-mute">Drag to turn the globe</p>
            </div>
            <ul className="lg:col-span-5">
              {siteConfig.shipping.markets.map((m, i) => (
                <Reveal as="li" key={m.code} delay={i * 0.05} className="flex items-baseline justify-between gap-6 border-t border-line py-5 last:border-b">
                  <p className="text-[15px] font-medium">{m.name}</p>
                  <p className="text-right text-[13px] text-mute">{m.hub}</p>
                </Reveal>
              ))}
              <Reveal as="li" delay={0.3} className="pt-6 text-[12.5px] leading-relaxed text-mute">
                {siteConfig.shipping.leadTimeDays}.
              </Reveal>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
