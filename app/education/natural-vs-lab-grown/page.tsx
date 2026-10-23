import React from "react";
import { Metadata } from "next";
import { ArticleShell, ArticleSection, ArticleCTA } from "@/components/education/Article";
import { Reveal } from "@/components/ui/Reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Natural vs Lab-Grown Diamonds: The Differences",
  description:
    "Natural and lab-grown diamonds look the same and are equally hard. Learn how they differ in origin and certification, and which suits your budget.",
  path: "/education/natural-vs-lab-grown",
});

const comparisonTable = [
  { parameter: "Material", natural: "Pure carbon", labGrown: "Pure carbon" },
  { parameter: "Hardness", natural: "10 (hardest)", labGrown: "10 (hardest)" },
  { parameter: "Sparkle", natural: "Same", labGrown: "Same" },
  { parameter: "How it forms", natural: "Deep in the earth over billions of years", labGrown: "In a lab in a few weeks" },
  { parameter: "Certificate", natural: "GIA", labGrown: "IGI" },
];

const CHOOSE = [
  {
    title: "Choose natural if",
    points: ["You want something rare", "You want a family heirloom"],
  },
  {
    title: "Choose lab-grown if",
    points: ["You want a bigger diamond for your budget", "You want a diamond made without mining"],
  },
];

export default function NaturalVsLabGrownPage() {
  return (
    <ArticleShell
      current="/education/natural-vs-lab-grown"
      crumb="Natural vs lab-grown"
      title={["Natural", { em: "or lab-grown?" }]}
      intro="Both are real diamonds. They look the same and are equally hard. The difference is where they come from."
    >
      <ArticleSection title="Side by side">
        <Reveal>
          <div className="overflow-x-auto rounded-[22px] border border-line bg-paper">
            <table className="w-full min-w-[480px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-ink text-[10.5px] uppercase tracking-[0.16em] text-mute">
                  <th className="p-5 font-medium"></th>
                  <th className="p-5 font-medium text-ink">Natural</th>
                  <th className="p-5 font-medium text-ink">Lab-grown</th>
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
                        {same && <span className="ml-2 rounded-full bg-porcelain px-2 py-0.5 text-[10.5px] uppercase tracking-[0.12em] text-mute">Both</span>}
                      </td>
                      {!same && <td className="p-5 text-ink-soft">{row.labGrown}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </ArticleSection>

      <ArticleSection title="Which one is right for you?">
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
      </ArticleSection>

      <ArticleCTA
        title="See both"
        body="We sell natural and lab-grown diamonds, each with its own certificate."
        actions={[
          { label: "Natural diamonds", href: "/diamonds?origin=Natural" },
          { label: "Lab-grown diamonds", href: "/diamonds?origin=Lab-Grown", variant: "outline" },
        ]}
      />
    </ArticleShell>
  );
}
