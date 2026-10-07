import React from "react";
import { Metadata } from "next";
import { ArticleShell, ArticleSection, Prose, ArticleCTA } from "@/components/education/Article";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Natural vs. Lab-Grown Diamonds Scientific Comparison | Novva Diamonds",
  description:
    "An objective scientific and market comparison between earth-mined natural diamonds and CVD/HPHT laboratory-grown diamonds.",
};

const comparisonTable = [
  { parameter: "Chemical composition", natural: "100% pure crystallised carbon (C)", labGrown: "100% pure crystallised carbon (C)", notes: "Identical atomic lattice; impossible to distinguish by chemical assay." },
  { parameter: "Crystal structure", natural: "Isometric-hexoctahedral (cubic)", labGrown: "Isometric-hexoctahedral (cubic)", notes: "Identical crystal lattice and cleaving planes." },
  { parameter: "Mohs hardness", natural: "10 (hardest known mineral)", labGrown: "10 (hardest known mineral)", notes: "Identical scratch resistance and durability." },
  { parameter: "Refractive index", natural: "2.417", labGrown: "2.417", notes: "Identical light refraction, brilliance and dispersion." },
  { parameter: "Specific gravity", natural: "3.52 g/cm³", labGrown: "3.52 g/cm³", notes: "Identical weight per volume." },
  { parameter: "Growth process", natural: "Mantle magma at 150–200 km depth over 1–3 billion years", labGrown: "CVD or HPHT in 4–12 weeks", notes: "Controlled growth chamber replicating deep-Earth conditions." },
  { parameter: "Purity classification", natural: "Predominantly Type Ia (trace nitrogen)", labGrown: "Predominantly Type IIa (near-zero nitrogen)", notes: "Type IIa represents the top 1–2% of rarest natural diamonds." },
  { parameter: "Third-party certification", natural: "GIA / IGI / HRD grading dossier", labGrown: "IGI / GIA laboratory-grown report", notes: "Laser inscription on the girdle details laboratory and origin." },
  { parameter: "Pricing & resale", natural: "Finite geological supply; established secondary market", labGrown: "Technology-driven supply; 70–85% lower cost per carat", notes: "Lab-grown maximises carat per budget; natural preserves rarity." },
];

const CHOOSE = [
  {
    title: "Choose natural if",
    points: [
      "You prioritise rare geological provenance formed over billions of years.",
      "You are building a generational heirloom or investment collection.",
      "You follow traditional fine jewellery conventions.",
    ],
  },
  {
    title: "Choose lab-grown if",
    points: [
      "You want the greatest carat weight and presence for your budget.",
      "You value Type IIa optical perfection with zero nitrogen discolouration.",
      "You prefer modern engineering with guaranteed non-conflict origin.",
    ],
  },
];

export default function NaturalVsLabGrownPage() {
  return (
    <ArticleShell
      current="/education/natural-vs-lab-grown"
      crumb="Natural vs lab-grown"
      eyebrow="Scientific transparency"
      title={["Natural", { em: "or lab-grown?" }, "An objective view."]}
      intro="Are lab-grown diamonds real? Yes. Under the U.S. Federal Trade Commission definition, a diamond is pure crystallised carbon in the isometric system — whether it formed 150 km beneath the crust or inside an advanced plasma chamber."
    >
      <ArticleSection title={<>Physical & optical <em>comparison</em></>}>
        <Reveal>
          <div className="overflow-x-auto rounded-[22px] border border-line bg-paper">
            <table className="w-full min-w-[640px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-ink text-[10.5px] uppercase tracking-[0.16em] text-mute">
                  <th className="p-5 font-medium">Property</th>
                  <th className="p-5 font-medium text-ink">Natural</th>
                  <th className="p-5 font-medium text-ink">Lab-grown</th>
                  <th className="hidden p-5 font-medium md:table-cell">Insight</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row) => {
                  const same = row.natural === row.labGrown;
                  return (
                    <tr key={row.parameter} className="border-b border-line transition-colors last:border-0 hover:bg-porcelain/50">
                      <td className="p-5 font-medium">{row.parameter}</td>
                      <td className="p-5 text-ink-soft" colSpan={same ? 2 : 1}>
                        {row.natural}
                        {same && <span className="ml-2 rounded-full bg-porcelain px-2 py-0.5 text-[10.5px] uppercase tracking-[0.12em] text-mute">Identical</span>}
                      </td>
                      {!same && <td className="p-5 text-ink-soft">{row.labGrown}</td>}
                      <td className="hidden p-5 text-[12.5px] text-mute md:table-cell">{row.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </ArticleSection>

      <ArticleSection title={<>Which is <em>right for you?</em></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          {CHOOSE.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08} className="rounded-[22px] border border-line bg-paper p-7">
              <h3 className="display text-[1.7rem]">{c.title}</h3>
              <ul className="mt-5 space-y-3">
                {c.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[14px] leading-relaxed text-ink-soft">
                    <span className="mt-[0.7em] h-px w-4 shrink-0 bg-champagne" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <Prose>
          <p className="mt-8">
            Novva stocks both and offers side-by-side microscopic video inspection, so you can decide on your own
            priorities.
          </p>
        </Prose>
      </ArticleSection>

      <ArticleCTA
        title="Compare both — in person or on video."
        body="Natural and lab-grown are catalogued separately and independently certified."
        actions={[
          { label: "Browse natural stones", href: "/diamonds?origin=Natural" },
          { label: "Browse lab-grown stones", href: "/diamonds?origin=Lab-Grown", variant: "outline" },
        ]}
      />
    </ArticleShell>
  );
}
