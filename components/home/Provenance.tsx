"use client";

import React from "react";
import SectionIntro from "@/components/ui/SectionIntro";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/config";
import RouteGlobe from "@/components/three/RouteGlobe";
import RouteMap from "./RouteMap";

const PILLARS = [
  {
    title: "Direct from Surat",
    body: "We buy straight from the cutting houses, so there is no middleman.",
  },
  {
    title: "Certified by GIA or IGI",
    body: "Every diamond has an original lab report you can check online.",
  },
  {
    title: "Insured shipping",
    body: "Each parcel is sealed and insured for its full value until it reaches you.",
  },
];

export default function Provenance() {
  return (
    <section className="relative border-t border-line bg-paper/50 py-24 sm:py-32" aria-label="Why choose us">
      <div className="shell">
        <SectionIntro title={["Why buy", { em: "from us" }]} />

        <ul className="mt-14 grid gap-8 sm:grid-cols-3 lg:mt-20">
          {PILLARS.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.08} className="border-t border-line pt-6">
              <h3 className="display text-[1.5rem] leading-tight sm:text-[1.65rem]">{p.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-mute">{p.body}</p>
            </Reveal>
          ))}
        </ul>

        {/* Delivery */}
        <div className="mt-24 sm:mt-32">
          <h2 className="display text-[1.9rem] sm:text-[2.4rem]">We ship worldwide</h2>
          <p className="mt-3 text-[14px] text-mute">Insured, door to door, in {siteConfig.shipping.leadTimeDays}.</p>

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
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
