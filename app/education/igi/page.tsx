import React from "react";
import { Metadata } from "next";
import { ArticleShell, ArticleSection, Prose, ArticleCTA } from "@/components/education/Article";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "IGI Certification & Laboratory Leadership | Novva Diamonds",
  description:
    "Explore the International Gemological Institute (IGI) grading standards, leadership in lab-grown diamond identification, and global recognition.",
};

const DISCLOSURES = [
  { t: "Clear origin identification", d: "States “Laboratory Grown Diamond” explicitly in the headline text." },
  { t: "Type IIa spectroscopic confirmation", d: "Confirms the absence of measurable nitrogen, certifying the highest chemical purity." },
  { t: "Laser inscription “LABGROWN IGI LG…”", d: "Guarantees the stone carries permanent microscopic provenance on its girdle." },
];

export default function IgiEducationPage() {
  return (
    <ArticleShell
      current="/education/igi"
      crumb="IGI standard"
      eyebrow="Antwerp heritage"
      title={["The IGI standard:", { em: "lab-grown pioneers." }]}
      intro="Founded in Antwerp in 1975, the International Gemological Institute operates 18 laboratories worldwide and is widely recognised as the preeminent authority for the certification of laboratory-grown diamonds."
    >
      <ArticleSection title={<>First to embrace <em>lab-grown diamonds</em></>}>
        <Prose>
          <p>
            In 2005, when many traditional institutions resisted grading laboratory-created stones, IGI became the first
            major international laboratory to issue comprehensive grading reports for lab-grown diamonds.
          </p>
          <p>
            IGI uses photoluminescence spectroscopy and FTIR infrared analysis to distinguish definitively between CVD
            (Chemical Vapour Deposition) and HPHT (High Pressure, High Temperature) growth, and identifies whether any
            post-growth treatment has occurred.
          </p>
        </Prose>
      </ArticleSection>

      <ArticleSection title={<>What an IGI report <em>discloses</em></>}>
        <ul className="border-t border-line">
          {DISCLOSURES.map((x, i) => (
            <Reveal as="li" key={x.t} delay={i * 0.07} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[1fr_1.4fr] sm:gap-8">
              <span className="text-[15px] font-medium">{x.t}</span>
              <span className="text-[14.5px] leading-relaxed text-mute">{x.d}</span>
            </Reveal>
          ))}
        </ul>
      </ArticleSection>

      <ArticleCTA
        title="Explore IGI-certified lab-grown diamonds."
        body="Type IIa stones, each with an official IGI verification link."
        actions={[{ label: "View IGI certified stones", href: "/diamonds?lab=IGI" }]}
      />
    </ArticleShell>
  );
}
