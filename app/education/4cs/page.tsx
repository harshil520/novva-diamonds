import React from "react";
import { Metadata } from "next";
import { ArticleShell, ArticleSection, Prose, FactGrid, ArticleCTA } from "@/components/education/Article";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Understanding the 4Cs of Diamonds | Novva Diamonds",
  description:
    "Master the 4Cs: Cut, Color, Clarity, and Carat. An in-depth technical analysis written by Surat diamond cutters.",
};

const COLOR_BANDS = [
  { grades: "D · E · F", name: "Colourless", body: "Rare and icy, offering zero discernible tint even under 10× master comparison.", tone: "bg-paper" },
  { grades: "G · H", name: "Near colourless", body: "Face-up completely white in platinum or white gold settings; exceptional commercial value.", tone: "bg-[#f5f2ea]" },
  { grades: "I · J", name: "Faint warmth", body: "Warm white tint visible from profile; pairs beautifully in yellow or rose gold mountings.", tone: "bg-[#efe8d9]" },
];

const CLARITY = [
  { g: "FL / IF", n: "Flawless" },
  { g: "VVS1 / VVS2", n: "Very, very slightly included" },
  { g: "VS1 / VS2", n: "Very slightly included" },
  { g: "SI1 / SI2", n: "Slightly included" },
];

export default function FourCsPage() {
  return (
    <ArticleShell
      current="/education/4cs"
      crumb="The 4Cs"
      eyebrow="Gemological benchmark"
      title={["The 4Cs:", { em: "cut, colour," }, "clarity & carat."]}
      intro="Established by the Gemological Institute of America in the 1940s, the 4Cs are the universal standard for assessing diamond quality and value. Here is a cutter’s view of what truly matters when selecting a certified stone."
    >
      <ArticleSection index="01" label="Highest visual impact" title={<>Cut — <em>the architecture of light</em></>}>
        <Prose>
          <p>
            Of all four characteristics, <strong>cut</strong> has the greatest influence on a diamond’s beauty. It is not
            the shape, but the precision with which facets are angled and aligned to manipulate light.
          </p>
        </Prose>
        <FactGrid
          cols={3}
          items={[
            { title: "Brilliance", body: "Total internal reflection of white light returned through the crown to the eye." },
            { title: "Fire", body: "Dispersion — the prism-like separation of white light into spectral flashes." },
            { title: "Scintillation", body: "Flashes of light and shadow created as the stone or the observer moves." },
          ]}
        />
      </ArticleSection>

      <ArticleSection index="02" label="D to J" title={<>Colour — <em>the absence of tint</em></>}>
        <Prose>
          <p>
            In white diamonds, colour grading measures the <em>absence</em> of colour. A chemically pure, structurally
            perfect diamond has no hue and transmits light with absolute clarity.
          </p>
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

      <ArticleSection index="03" label="FL to SI2" title={<>Clarity — <em>microscopic purity</em></>}>
        <Prose>
          <p>
            Diamonds form under enormous geological forces. As crystals grow, microscopic internal features (inclusions)
            and surface irregularities (blemishes) develop. Clarity measures their size, number, position and nature.
          </p>
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

      <ArticleSection index="04" label="Mass, not size" title={<>Carat — <em>the measure of weight</em></>}>
        <Prose>
          <p>
            One metric carat equals exactly 200 milligrams (0.20 grams). A common misconception is that carat denotes
            visual footprint. A poorly cut 1.50 carat stone with excessive depth can appear smaller face-up than a
            well-proportioned 1.30 carat stone. Always read millimetre measurements alongside carat weight.
          </p>
        </Prose>
      </ArticleSection>

      <ArticleCTA
        title="Put the 4Cs into practice."
        body="Browse verified inventory filtered by exact colour, clarity and cut parameters."
        actions={[{ label: "Explore certified inventory", href: "/diamonds" }]}
      />
    </ArticleShell>
  );
}
