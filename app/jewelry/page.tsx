import React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/config/config";
import PageHeader from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink, ArrowGlyph } from "@/components/ui/Button";
import DiamondCanvas from "@/components/three/DiamondCanvas";

export const metadata: Metadata = {
  title: "Jewelry | Novva Diamonds",
  description: "Diamond jewelry in 18K gold and platinum.",
};

const PIECES = [
  { t: "Rings", d: "Solitaire and halo rings in platinum or 18K gold." },
  { t: "Bracelets", d: "Tennis bracelets with matched diamonds." },
  { t: "Pendants & earrings", d: "Simple solitaire pendants and studs." },
];

export default function JewelryPage() {
  if (!siteConfig.features.showJewelry) {
    return (
      <div className="shell grid min-h-[88vh] items-center gap-10 pb-16 pt-[110px] lg:grid-cols-2">
        <div className="relative order-first mx-auto aspect-square w-full max-w-[420px] lg:order-last">
          <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.95),transparent)]" />
          <DiamondCanvas shape="Cushion" autoRotate={0.3} tilt={0.7} fill={0.6} ariaLabel="Cushion cut diamond" />
        </div>
        <div>
          <h1 className="display text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.98]">
            Jewelry <em>coming soon</em>
          </h1>
          <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-mute">For now, we sell loose diamonds only.</p>
          <div className="mt-10">
            <ButtonLink href="/diamonds" size="lg">
              View diamonds <ArrowGlyph />
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        title={["Jewelry in", { em: "gold & platinum" }]}
        intro="Choose a diamond and we will set it in a ring, pendant or earrings."
      />
      <div className="shell grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-3">
        {PIECES.map((p, i) => (
          <Reveal key={p.t} delay={i * 0.06} className="bg-ivory p-8 sm:p-10">
            <h2 className="display text-[1.7rem] leading-tight">{p.t}</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-mute">{p.d}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
