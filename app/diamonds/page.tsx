import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { diamondsData } from "@/data/diamonds";
import { absoluteUrl, breadcrumbJsonLd, diamondName, pageMetadata } from "@/lib/seo";
import CatalogClient from "./CatalogClient";

// Render per request so the filtered results (read from the URL) are in the HTML, not only after hydration.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Certified Loose Diamonds, Natural and Lab-Grown",
  description:
    "Browse certified loose diamonds from 1 ct, natural and lab-grown, graded by GIA or IGI. Filter by shape, carat, colour, clarity and cut. Shipped insured from Surat.",
  path: "/diamonds",
});

export default function DiamondsPage() {
  const listed = diamondsData.filter((d) => d.availability !== "Sold");
  return (
    <>
      <JsonLd
        data={[
          {
            "@type": "CollectionPage",
            name: "Certified loose diamonds",
            url: absoluteUrl("/diamonds"),
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: listed.length,
              itemListElement: listed.map((d, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: diamondName(d),
                url: absoluteUrl(`/diamonds/${d.id}`),
              })),
            },
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Diamonds", path: "/diamonds" },
          ]),
        ]}
      />
      <CatalogClient />
    </>
  );
}
