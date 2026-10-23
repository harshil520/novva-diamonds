import Hero from "@/components/home/Hero";
import ShapeExplorer from "@/components/home/ShapeExplorer";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import Provenance from "@/components/home/Provenance";
import OriginCompare from "@/components/home/OriginCompare";
import FAQ from "@/components/home/FAQ";
import Concierge from "@/components/home/Concierge";
import JsonLd from "@/components/seo/JsonLd";
import { FAQ_ITEMS } from "@/data/faq";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Novva Diamonds | Certified Loose Diamonds from Surat, India",
  description:
    "Buy GIA and IGI certified natural and lab-grown loose diamonds direct from the Surat Diamond Bourse. 1 ct and above, with fully insured worldwide shipping.",
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />
      <Hero />
      <FeaturedCollection />
      <ShapeExplorer />
      <Provenance />
      <OriginCompare />
      <FAQ />
      <Concierge />
    </>
  );
}
