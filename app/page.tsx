import Hero from "@/components/home/Hero";
import ShapeExplorer from "@/components/home/ShapeExplorer";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import Provenance from "@/components/home/Provenance";
import OriginCompare from "@/components/home/OriginCompare";
import FAQ from "@/components/home/FAQ";
import Concierge from "@/components/home/Concierge";

export default function HomePage() {
  return (
    <>
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
