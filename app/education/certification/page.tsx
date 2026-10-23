import React from "react";
import { Metadata } from "next";
import { ArticleShell, ArticleSection, Prose, FactGrid, ArticleCTA } from "@/components/education/Article";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Diamond Certificates | Novva Diamonds",
  description: "What a GIA or IGI certificate is, and how to check one.",
};

const STEPS = [
  {
    t: "Check the number online",
    d: "Enter the report number on the GIA or IGI website. Make sure the carat, colour and clarity match.",
  },
  {
    t: "Find the laser number",
    d: "The same number is laser-engraved on the edge of the diamond. A jeweller can show it to you with a loupe.",
  },
  {
    t: "Check the size",
    d: "The measurements in millimetres should match the report.",
  },
];

export default function CertificationGuidePage() {
  return (
    <ArticleShell
      current="/education/certification"
      crumb="Certificates"
      title={["Diamond", { em: "certificates" }]}
      intro="A certificate is a report from an independent lab. It confirms the diamond's carat, colour, clarity and cut."
    >
      <ArticleSection title="Who issues them">
        <Prose>
          <p>We only sell diamonds graded by an independent lab, never by the seller.</p>
        </Prose>
        <FactGrid
          items={[
            { title: "GIA", body: "The best-known lab for natural diamonds." },
            { title: "IGI", body: "The leading lab for lab-grown diamonds." },
          ]}
        />
      </ArticleSection>

      <ArticleSection title="How to check a certificate">
        <ol className="border-t border-line">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.08} className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-line py-7">
              <span className="display numeric text-[2.4rem] leading-none text-ink/25">{i + 1}</span>
              <div>
                <h3 className="text-[16px] font-medium">{s.t}</h3>
                <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-mute">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </ArticleSection>

      <ArticleCTA
        title="Questions about a certificate?"
        body="We are happy to go through any report with you."
        actions={[{ label: "Contact us", href: "/contact" }]}
      />
    </ArticleShell>
  );
}
