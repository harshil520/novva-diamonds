import React from "react";
import { Metadata } from "next";
import { ArticleShell, ArticleSection, Prose, FactGrid, ArticleCTA } from "@/components/education/Article";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Diamond Certification Guide | Novva Diamonds",
  description:
    "Learn why independent certification from GIA and IGI is essential for certified loose diamonds and how to verify reports and laser inscriptions.",
};

const STEPS = [
  {
    t: "Cross-check the report number online",
    d: "Enter the certificate number into the official GIA Report Check or IGI Verify portal. Confirm that carat weight, colour, clarity and dimensions match exactly.",
  },
  {
    t: "Inspect the girdle laser inscription",
    d: "With a 10× gemological loupe or microscope, locate the laser-inscribed laboratory logo and report number on the stone’s outer perimeter.",
  },
  {
    t: "Confirm optical measurements",
    d: "Verify length, width and depth with digital micrometer calipers — tolerances should sit within 0.02 mm of the certified record.",
  },
];

export default function CertificationGuidePage() {
  return (
    <ArticleShell
      current="/education/certification"
      crumb="Certification"
      eyebrow="Trust & independence"
      title={["Certification,", { em: "inscriptions" }, "& verification."]}
      intro="A diamond certificate is not an appraisal or an invoice. It is an objective scientific report, issued by an accredited gemological laboratory, identifying the physical and optical properties of one specific stone."
    >
      <ArticleSection title={<>Why independent grading <em>is essential</em></>}>
        <Prose>
          <p>
            In-house grading or “seller certificates” represent a clear conflict of interest. An independent laboratory
            has no financial stake in the sale of the diamond — its reputation rests solely on scientific precision and
            consistency.
          </p>
        </Prose>
        <FactGrid
          items={[
            { title: "GIA — Gemological Institute of America", body: "The global benchmark for natural diamonds. Renowned for strict clarity and colour grading standards." },
            { title: "IGI — International Gemological Institute", body: "The leader in certifying laboratory-grown diamonds, with detailed spectroscopic growth identification." },
          ]}
        />
      </ArticleSection>

      <ArticleSection title={<>Verify a diamond <em>in three steps</em></>}>
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
        body="Our Surat specialists will review any report with you, facet by facet."
        actions={[{ label: "Speak with a gemologist", href: "/contact" }]}
      />
    </ArticleShell>
  );
}
