import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import SectionIntro from "@/components/ui/SectionIntro";
import { ButtonLink, ArrowGlyph } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import DiamondCanvas from "@/components/three/DiamondCanvas";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About Novva Diamonds — Direct Diamond Exporter from Surat, India",
  description:
    "Learn about Novva Diamonds: our Surat Diamond Bourse heritage, precision cutting standards, GIA/IGI certified inventory, and direct export to international jewelers.",
};

const STATS = [
  { k: "Global cutting", v: "90%+", n: "Processed in Surat" },
  { k: "Certification", v: "GIA / IGI", n: "Third-party verified" },
  { k: "Export hubs", v: "6 continents", n: "Insured armoured air" },
  { k: "Business model", v: "Direct", n: "Zero middlemen" },
];

const SCOPE = [
  {
    t: "Certified natural diamonds",
    d: "Earth-mined stones with verified, conflict-free Kimberley Process provenance, graded by GIA. We focus on Triple Excellent rounds and balanced fancy cuts with high fire.",
  },
  {
    t: "Certified lab-grown diamonds",
    d: "Type IIa stones grown by CVD and HPHT, certified by IGI with full spectroscopic confirmation of optical clarity and untreated status.",
  },
  {
    t: "Bespoke sourcing on the bourse",
    d: "A matched pair of emerald cuts, an elongated 1.55+ ratio oval, a specific investment carat — we locate matching stones across Surat’s trading floors.",
  },
  {
    t: "Armoured worldwide export",
    d: "Complete documentation, international commercial invoicing and door-to-door armoured courier via Brink’s or Malca-Amit, comprehensively insured.",
  },
];

const WHY = [
  {
    t: "Direct seller interaction",
    d: "You discuss specifications with a diamond professional who physically examines the stones under a loupe — not a representative reading a spreadsheet.",
  },
  {
    t: "Transparent invoicing & video inspection",
    d: "360° high-magnification video, ASET / Ideal-Scope light-return diagnostics and high-resolution certificate scans — before any payment or dispatch.",
  },
  {
    t: "Secure payment & escrow",
    d: "Verified international wire transfers and recognised third-party diamond escrow, so first-time partners transact with complete security.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="Maison · Surat heritage"
        title={["Rooted in Surat.", { em: "Trusted" }, "worldwide."]}
        intro="Novva Diamonds was founded on a simple principle: jewellers and private collectors deserve direct access to the source of the world’s diamond cutting industry — without opaque, multi-layered markups."
        aside={
          <div className="relative mx-auto aspect-square w-full max-w-[460px]">
            <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.95),transparent)]" />
            <DiamondCanvas shape="Emerald" autoRotate={0.3} tilt={0.75} fill={0.62} interactive ariaLabel="Emerald cut diamond, drag to rotate" />
          </div>
        }
      />

      {/* Bourse advantage */}
      <section className="border-t border-line bg-paper/50 py-24 sm:py-32">
        <div className="shell">
          <SectionIntro
            eyebrow="The Surat Diamond Bourse advantage"
            title={["At the centre of", { em: "the craft." }]}
          />
          <div className="mt-14 grid gap-8 text-[15.5px] leading-[1.75] text-ink-soft/90 md:grid-cols-2 lg:mt-20">
            <Reveal>
              <p>
                Surat, Gujarat is the undisputed capital of the global diamond industry. Over 90% of all rough diamonds
                mined on Earth are cut and polished here by master craftsmen, combining generational heritage with
                optical lasers and automated facet planners.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <p>
                Working inside the Surat Diamond Bourse, we inspect freshly cut parcels the moment they are finished and
                select only stones that meet our criteria for light return, facet symmetry and crystalline transparency.
              </p>
            </Reveal>
          </div>
          <dl className="mt-16 grid grid-cols-2 border-t border-line lg:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.k} delay={i * 0.06} className={`py-8 pr-4 ${i % 2 ? "border-l border-line pl-5" : ""} ${i > 1 ? "max-lg:border-t max-lg:border-line" : ""} ${i === 2 ? "lg:border-l lg:pl-5" : ""}`}>
                <dt className="eyebrow">{s.k}</dt>
                <dd className="display mt-3 text-[2rem] leading-none sm:text-[2.6rem]">{s.v}</dd>
                <dd className="mt-2 text-[12.5px] text-mute">{s.n}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Scope */}
      <section className="py-24 sm:py-32">
        <div className="shell">
          <SectionIntro eyebrow="Core capabilities" title={["What we", { em: "offer." }]} />
          <div className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 lg:mt-20">
            {SCOPE.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.06} className="group bg-ivory p-8 transition-colors duration-500 hover:bg-paper sm:p-10">
                <span className="numeric text-[12px] text-faint">0{i + 1}</span>
                <h3 className="display mt-6 text-[1.8rem] leading-tight">{s.t}</h3>
                <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-mute">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-t border-line py-24 sm:py-32">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro align="left" eyebrow="Operational standards" title={["Why buyers", { em: "work with us." }]} />
          </div>
          <ol className="lg:col-span-7">
            {WHY.map((w, i) => (
              <Reveal as="li" key={w.t} delay={i * 0.08} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-line py-8 last:border-b">
                <span className="numeric pt-1.5 text-[12px] text-faint">0{i + 1}</span>
                <div>
                  <h3 className="text-[17px] font-medium">{w.t}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-mute">{w.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="shell pb-16">
        <Reveal className="rounded-[32px] bg-ink px-7 py-14 text-center text-ivory sm:px-14 sm:py-20">
          <p className="eyebrow text-ivory/50">Speak with Novva</p>
          <h2 className="display mx-auto mt-5 max-w-2xl text-[2.4rem] leading-[1.02] sm:text-[3.6rem]">
            A custom project, or a question <em>about a stone?</em>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[14.5px] leading-relaxed text-ivory/60">Connect directly with our Surat office.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href={getConciergeWhatsAppUrl({ topic: "general" })} variant="light" size="lg" className="border-transparent">
              <WhatsAppIcon size={16} /> Connect on WhatsApp
            </ButtonLink>
            <Link href="/diamonds" className="group inline-flex h-14 items-center gap-2 rounded-full border border-ivory/25 px-7 text-[14px] font-medium transition-colors hover:border-ivory">
              Explore the collection <ArrowGlyph />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
