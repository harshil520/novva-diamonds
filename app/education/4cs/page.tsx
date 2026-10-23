import React from "react";
import { Metadata } from "next";
import { ArticleShell, ArticleSection, Prose, ArticleCTA } from "@/components/education/Article";
import { Reveal } from "@/components/ui/Reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "The 4Cs of Diamonds: Cut, Colour, Clarity, Carat",
  description:
    "What cut, colour, clarity and carat mean: the D to Z colour scale, clarity grades from FL to SI2, why cut drives sparkle, and why carat is weight, not size.",
  path: "/education/4cs",
});

const COLOR_BANDS = [
  { grades: "D · E · F", name: "Colourless", body: "No visible colour.", tone: "bg-paper" },
  { grades: "G · H", name: "Near colourless", body: "Looks white once set in a ring.", tone: "bg-[#f5f2ea]" },
  { grades: "I · J", name: "Faint tint", body: "Slight warm tint. Looks good in yellow or rose gold.", tone: "bg-[#efe8d9]" },
];

const CLARITY = [
  { g: "FL / IF", n: "Flawless" },
  { g: "VVS1 / VVS2", n: "Very, very slight marks" },
  { g: "VS1 / VS2", n: "Very slight marks" },
  { g: "SI1 / SI2", n: "Slight marks" },
];

export default function FourCsPage() {
  return (
    <ArticleShell
      current="/education/4cs"
      crumb="The 4Cs"
      title={["The", { em: "4Cs" }]}
      intro="Cut, colour, clarity and carat are the four things that decide how a diamond looks."
    >
      <ArticleSection title="Cut">
        <Prose>
          <p>
            Cut is how well the diamond is shaped and polished. A good cut gives more sparkle. It matters more than any of
            the other Cs.
          </p>
        </Prose>
      </ArticleSection>

      <ArticleSection title="Colour">
        <Prose>
          <p>Graded from D (no colour) to Z. The less colour, the rarer the diamond.</p>
        </Prose>
        <div className="mt-8 overflow-hidden rounded-[22px] border border-line">
          {COLOR_BANDS.map((b, i) => (
            <Reveal key={b.grades} delay={i * 0.06} className={`grid gap-2 border-line p-6 sm:grid-cols-[9rem_10rem_1fr] sm:items-baseline sm:gap-6 ${i > 0 ? "border-t" : ""} ${b.tone}`}>
              <span className="display text-[1.6rem] leading-none">{b.grades}</span>
              <span className="text-[13px] font-medium">{b.name}</span>
              <span className="text-[13.5px] leading-relaxed text-mute">{b.body}</span>
            </Reveal>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection title="Clarity">
        <Prose>
          <p>Clarity shows how many tiny marks a diamond has inside or on its surface. Most are too small to see.</p>
        </Prose>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CLARITY.map((c, i) => (
            <Reveal key={c.g} delay={i * 0.06} className="rounded-[20px] border border-line bg-paper p-5">
              <span className="block h-1 w-full rounded-full bg-gradient-to-r from-ink to-ink/0" style={{ opacity: 1 - i * 0.22 }} />
              <p className="display mt-5 text-[1.35rem] leading-none">{c.g}</p>
              <p className="mt-2 text-[12.5px] text-mute">{c.n}</p>
            </Reveal>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection title="Carat">
        <Prose>
          <p>
            Carat is weight, not size. One carat is 0.2 grams. Two diamonds with the same weight can look different in
            size, so check the measurements in millimetres too.
          </p>
        </Prose>
      </ArticleSection>

      <ArticleCTA
        title="Find your diamond"
        body="Filter by colour, clarity, cut and carat."
        actions={[{ label: "View diamonds", href: "/diamonds" }]}
      />
    </ArticleShell>
  );
}
