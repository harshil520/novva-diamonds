import React from "react";
import { Metadata } from "next";
import { ArticleShell, ArticleSection, Prose, FactGrid, ArticleCTA } from "@/components/education/Article";

export const metadata: Metadata = {
  title: "GIA Laboratory Standard & Grading | Novva Diamonds",
  description:
    "An expert analysis of the Gemological Institute of America (GIA) grading standards, history, and why GIA reports command international trust.",
};

export default function GiaEducationPage() {
  return (
    <ArticleShell
      current="/education/gia"
      crumb="GIA standard"
      eyebrow="Global gold standard"
      title={["The GIA standard:", { em: "history, science" }, "& report anatomy."]}
      intro="Established in 1931 by Robert M. Shipley, the Gemological Institute of America is a non-profit institute widely considered the world’s foremost authority on gemology."
    >
      <ArticleSection title={<>The origin of the <em>modern diamond language</em></>}>
        <Prose>
          <p>
            Before GIA, diamond grading was inconsistent. Terms like “blue-white”, “commercial quality” and “gem grade”
            were subjective and easily manipulated. GIA introduced the standardised D-to-Z colour scale — deliberately
            starting at D to break from ambiguous A/B/C systems — and the standardised clarity hierarchy.
          </p>
        </Prose>
      </ArticleSection>

      <ArticleSection title={<>Anatomy of a <em>GIA dossier</em></>}>
        <FactGrid
          items={[
            { title: "GIA report number", body: "A unique 10-digit identifier permanently logged in GIA’s global database." },
            { title: "Shape and cutting style", body: "Exact geometric classification, e.g. Round Brilliant, Cushion Modified." },
            { title: "Carat weight & dimensions", body: "Calibrated to 1/1000th carat, recorded to two decimals with three-dimensional caliper measurements." },
            { title: "Proportions & facet angles", body: "Crown angle, pavilion depth, table percentage and culet size." },
          ]}
        />
      </ArticleSection>

      <ArticleCTA
        title="Browse GIA-certified natural diamonds."
        body="Every listing links to its live official report."
        actions={[{ label: "View GIA certified stones", href: "/diamonds?lab=GIA" }]}
      />
    </ArticleShell>
  );
}
