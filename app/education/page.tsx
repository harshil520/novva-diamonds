import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowGlyph } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Diamond Education Hub | Novva Diamonds",
  description:
    "Master the 4Cs, understand GIA & IGI certifications, and explore the transparent science of natural vs lab-grown diamonds with Novva Diamonds.",
};

const articles = [
  {
    title: "Understanding the 4Cs",
    description: "Cut, colour, clarity and carat weight — how each shapes brilliance and value.",
    href: "/education/4cs",
    badge: "Core fundamentals",
  },
  {
    title: "Diamond certification",
    description: "Why independent grading matters, how to read a report, and how to verify a laser inscription.",
    href: "/education/certification",
    badge: "Verification",
  },
  {
    title: "The GIA standard",
    description: "The benchmark of natural diamond grading, and how GIA created the international diamond language.",
    href: "/education/gia",
    badge: "Grading authority",
  },
  {
    title: "IGI & lab-grown expertise",
    description: "The world leader in laboratory-grown and fancy-shape documentation. Understanding IGI report metrics.",
    href: "/education/igi",
    badge: "Lab-grown standard",
  },
  {
    title: "Natural vs lab-grown",
    description: "A transparent scientific comparison of earth-mined diamonds and Type IIa laboratory-grown diamonds.",
    href: "/education/natural-vs-lab-grown",
    badge: "Comparative science",
  },
];

export default function EducationHubPage() {
  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Knowledge centre"
        title={["An educated buyer is", { em: "a confident one." }]}
        intro="Guides on diamond optics, grading methodology and laboratory verification — written from the cutting floor in Surat."
      />
      <div className="shell">
        <ol className="border-t border-ink">
          {articles.map((a, i) => (
            <Reveal as="li" key={a.href} delay={i * 0.05}>
              <Link
                href={a.href}
                className="group relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 overflow-hidden border-b border-line py-8 sm:grid-cols-[4rem_1.2fr_1fr_auto] sm:gap-8 sm:py-10"
              >
                <span aria-hidden="true" className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-porcelain transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-y-100" />
                <span className="numeric text-[12px] text-faint sm:pl-4">0{i + 1}</span>
                <span>
                  <span className="eyebrow block text-[10px]">{a.badge}</span>
                  <span className="display mt-2 block text-[1.9rem] leading-[1.02] transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-2 sm:text-[2.8rem]">
                    {a.title}
                  </span>
                </span>
                <span className="col-span-3 col-start-2 max-w-md text-[14px] leading-relaxed text-mute sm:col-span-1 sm:col-start-3">{a.description}</span>
                <span className="row-start-1 col-start-3 flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory sm:col-start-4 sm:mr-4">
                  <ArrowGlyph />
                </span>
              </Link>
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  );
}
