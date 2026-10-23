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
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Novva Diamonds | Diamond Dealer, Surat Diamond Bourse",
  description:
    "Novva Diamonds sells GIA and IGI certified natural and lab-grown loose diamonds directly from the Surat Diamond Bourse in India, shipped fully insured worldwide.",
  path: "/about",
  absoluteTitle: true,
});

const STATS = [
  { v: "90%+", n: "of the world's diamonds are cut in Surat" },
  { v: "GIA / IGI", n: "certified diamonds only" },
  { v: "1 ct+", n: "minimum carat weight" },
  { v: "Direct", n: "no middlemen" },
];

const OFFER = [
  { t: "Natural diamonds", d: "Mined diamonds, certified by GIA and conflict-free." },
  { t: "Lab-grown diamonds", d: "Grown in a lab, certified by IGI, with no treatment after growth." },
  { t: "Diamond search", d: "Need a shape or size we don't list? We will find it in Surat." },
  { t: "Worldwide shipping", d: "Insured door-to-door delivery with all customs papers." },
];

export default function AboutPage() {
  return (
    <div className="pb-8">
      <PageHeader
        title={["About", { em: "us" }]}
        intro="We are a diamond company in Surat, India, where most of the world's diamonds are cut. We sell certified diamonds directly to jewellers and private buyers."
        aside={
          <div className="relative mx-auto aspect-square w-full max-w-[460px]">
            <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.95),transparent)]" />
            <DiamondCanvas shape="Emerald" autoRotate={0.3} tilt={0.75} fill={0.62} interactive ariaLabel="Emerald cut diamond, drag to rotate" />
          </div>
        }
      />

      {/* Stats */}
      <section className="border-t border-line bg-paper/50 py-16 sm:py-20">
        <dl className="shell grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06} className={`py-6 pr-4 ${i % 2 ? "border-l border-line pl-5" : ""} ${i > 1 ? "max-lg:border-t max-lg:border-line" : ""} ${i === 2 ? "lg:border-l lg:pl-5" : ""}`}>
              <dd className="display text-[2rem] leading-none sm:text-[2.6rem]">{s.v}</dd>
              <dt className="mt-2 text-[12.5px] text-mute">{s.n}</dt>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* What we offer */}
      <section className="py-24 sm:py-32">
        <div className="shell">
          <SectionIntro title={["What we", { em: "offer" }]} />
          <div className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 lg:mt-20">
            {OFFER.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.06} className="bg-ivory p-8 transition-colors duration-500 hover:bg-paper sm:p-10">
                <h3 className="display text-[1.8rem] leading-tight">{s.t}</h3>
                <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-mute">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="shell pb-16">
        <Reveal className="rounded-[32px] bg-ink px-7 py-14 text-center text-ivory sm:px-14 sm:py-20">
          <h2 className="display mx-auto max-w-2xl text-[2.4rem] leading-[1.02] sm:text-[3.6rem]">
            Have a <em>question?</em>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href={getConciergeWhatsAppUrl({ topic: "general" })} variant="light" size="lg" className="border-transparent">
              <WhatsAppIcon size={16} /> WhatsApp us
            </ButtonLink>
            <Link href="/diamonds" className="group inline-flex h-14 items-center gap-2 rounded-full border border-ivory/25 px-7 text-[14px] font-medium transition-colors hover:border-ivory">
              View diamonds <ArrowGlyph />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
