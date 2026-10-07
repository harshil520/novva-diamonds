import React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/config/config";
import PageHeader from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink, ArrowGlyph } from "@/components/ui/Button";
import DiamondCanvas from "@/components/three/DiamondCanvas";

export const metadata: Metadata = {
  title: "Bespoke Jewelry Mountings | Novva Diamonds",
  description: "Finished jewelry mountings handcrafted in 18K Gold and Platinum for certified loose diamonds.",
};

const PIECES = [
  { t: "Solitaire & halo rings", d: "Micro-prong, cathedral and bezel settings in platinum 950 and 18K gold." },
  { t: "Diamond tennis bracelets", d: "Calibrated, matched parcels of natural or lab-grown diamonds in four-prong links." },
  { t: "Bespoke pendants & studs", d: "Classic martini three-prong and four-prong basket solitaire mountings." },
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
          <p className="eyebrow">The atelier · In preparation</p>
          <h1 className="display mt-5 text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.98]">
            Finished jewellery, <em>coming soon.</em>
          </h1>
          <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-mute">
            Novva currently focuses exclusively on certified loose diamond export and direct bourse trade. Our bespoke
            mountings atelier in 18K gold and 950 platinum will open in an upcoming release.
          </p>
          <div className="mt-10">
            <ButtonLink href="/diamonds" size="lg">
              Explore certified loose diamonds <ArrowGlyph />
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Bespoke atelier"
        title={["Fine settings in", { em: "18K gold & platinum." }]}
        intro="Pair any certified loose diamond from our Surat vault with a handcrafted mounting made to its exact millimetre dimensions."
      />
      <div className="shell grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-3">
        {PIECES.map((p, i) => (
          <Reveal key={p.t} delay={i * 0.06} className="bg-ivory p-8 sm:p-10">
            <span className="numeric text-[12px] text-faint">0{i + 1}</span>
            <h2 className="display mt-6 text-[1.7rem] leading-tight">{p.t}</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-mute">{p.d}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
