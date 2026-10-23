import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import DiamondViewer from "@/components/diamond/DiamondViewer";
import DiamondCard from "@/components/diamond/DiamondCard";
import { StoneActions, CertificateCard, MobileStoneBar } from "@/components/diamond/StoneActions";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink, ArrowGlyph } from "@/components/ui/Button";
import JsonLd from "@/components/seo/JsonLd";
import { diamondsData } from "@/data/diamonds";
import { breadcrumbJsonLd, diamondDescription, diamondJsonLd, diamondName, pageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return diamondsData.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const diamond = diamondsData.find((d) => d.id === id);
  if (!diamond) return { title: "Diamond Not Found", robots: { index: false } };

  const base = pageMetadata({
    title: `${diamondName(diamond)}, ${diamond.certification.laboratory}`,
    description: diamondDescription(diamond),
    path: `/diamonds/${diamond.id}`,
  });
  const image = { url: diamond.images[0], alt: diamondName(diamond) };
  return {
    ...base,
    openGraph: { ...base.openGraph, images: [image] },
    twitter: { ...base.twitter, images: [image] },
  };
}

const COLOR_NOTE: Record<string, string> = {
  D: "Colourless",
  E: "Colourless",
  F: "Colourless",
  G: "Near colourless",
  H: "Near colourless",
  I: "Faint tint",
  J: "Faint tint",
};

const CLARITY_NOTE: Record<string, string> = {
  FL: "Flawless",
  IF: "Internally flawless",
  VVS1: "Very, very slight",
  VVS2: "Very, very slight",
  VS1: "Very slight",
  VS2: "Very slight",
  SI1: "Slightly included",
  SI2: "Slightly included",
};

export default async function DiamondDetailPage({ params }: PageProps) {
  const { id } = await params;
  const diamond = diamondsData.find((d) => d.id === id);

  if (!diamond) {
    notFound();
  }

  // Similar diamonds: same shape or origin, within 1.2 ct
  const similarDiamonds = diamondsData
    .filter(
      (d) =>
        d.id !== diamond.id &&
        (d.shape === diamond.shape || d.origin === diamond.origin) &&
        Math.abs(d.carat - diamond.carat) <= 1.2
    )
    .slice(0, 3);

  const ratio = diamond.ratio ?? +(diamond.dimensions.length / diamond.dimensions.width).toFixed(2);

  const fourCs = [
    { k: "Carat", v: diamond.carat.toFixed(2), note: `${diamond.dimensions.length} × ${diamond.dimensions.width} mm` },
    { k: "Colour", v: diamond.color, note: COLOR_NOTE[diamond.color] },
    { k: "Clarity", v: diamond.clarity, note: CLARITY_NOTE[diamond.clarity] },
    { k: "Cut", v: diamond.cut, note: `${diamond.polish ?? "Excellent"} polish` },
  ];

  const details: [string, string][] = [
    ["Measurements", `${diamond.dimensions.length} × ${diamond.dimensions.width} × ${diamond.dimensions.depth} mm`],
    ["Table", `${diamond.tablePercentage || 58}%`],
    ["Depth", `${diamond.depthPercentage || 61.5}%`],
    ["Length / width ratio", ratio.toFixed(2)],
    ["Polish", diamond.polish || "Excellent"],
    ["Symmetry", diamond.symmetry || "Excellent"],
    ["Fluorescence", diamond.fluorescence || "None"],
    ["Origin", diamond.origin === "Lab-Grown" ? "Lab-grown" : "Natural"],
    ["Lab report", `${diamond.certification.laboratory} ${diamond.certification.certificateNumber}`],
    ["Laser inscription", diamond.certification.inscribed === false ? "No" : "Yes"],
  ];

  return (
    <div className="pb-16 pt-[72px]">
      <JsonLd
        data={[
          diamondJsonLd(diamond),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Diamonds", path: "/diamonds" },
            { name: diamondName(diamond), path: `/diamonds/${diamond.id}` },
          ]),
        ]}
      />
      <div className="shell">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 py-6 text-[12px] text-mute">
          <Link href="/" className="link-draw hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/diamonds" className="link-draw hover:text-ink">
            Diamonds
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="numeric text-ink">{diamond.id}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Viewer */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <DiamondViewer diamond={diamond} />
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-mute">
              <span>
                {diamond.origin === "Lab-Grown" ? "Lab-grown" : "Natural"} · {diamond.certification.laboratory}
              </span>
              <span className="numeric">{diamond.id}</span>
            </div>
            <h1 className="display mt-4 text-[clamp(2.6rem,5vw,4.2rem)] leading-[0.98]">
              {diamond.carat.toFixed(2)} ct <em>{diamond.shape}</em>
            </h1>
            {diamond.description && <p className="mt-5 text-[15px] leading-relaxed text-ink-soft/85">{diamond.description}</p>}

            <dl className="mt-8 grid grid-cols-4 border-y border-line">
              {fourCs.map((c, i) => (
                <div key={c.k} className={`py-4 ${i > 0 ? "border-l border-line pl-3 sm:pl-4" : ""}`}>
                  <dt className="text-[10.5px] uppercase tracking-[0.16em] text-mute">{c.k}</dt>
                  <dd className="display mt-1.5 text-[1.35rem] leading-none sm:text-[1.6rem]">{c.v}</dd>
                  <dd className="mt-1.5 hidden text-[11px] leading-snug text-faint sm:block">{c.note}</dd>
                </div>
              ))}
            </dl>

            <div id="stone-actions" className="mt-8">
              <StoneActions diamond={diamond} />
            </div>

            <div className="mt-8">
              <CertificateCard diamond={diamond} />
            </div>
          </div>
        </div>

        {/* Details */}
        <section className="mt-24 border-t border-line pt-16 sm:mt-32" aria-labelledby="details">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <h2 id="details" className="display text-[2.4rem] leading-[1.02] sm:text-[3rem]">
                Details
              </h2>
            </Reveal>
            <dl className="grid sm:grid-cols-2 lg:col-span-8 lg:gap-x-10">
              {details.map(([k, v], i) => (
                <Reveal key={k} delay={(i % 2) * 0.05} className="flex items-baseline justify-between gap-6 border-t border-line py-5">
                  <dt className="text-[13px] text-mute">{k}</dt>
                  <dd className="numeric text-right text-[15px] font-medium">{v}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* Similar */}
        {similarDiamonds.length > 0 && (
          <section className="mt-24 sm:mt-32" aria-labelledby="similar">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="similar" className="display text-[2.2rem] sm:text-[2.8rem]">
                Similar diamonds
              </h2>
              <ButtonLink href={`/diamonds?shape=${diamond.shape}`} variant="outline">
                All {diamond.shape} diamonds <ArrowGlyph />
              </ButtonLink>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-3">
              {similarDiamonds.map((d, i) => (
                <Reveal key={d.id} delay={i * 0.08} className={i === 2 ? "max-lg:hidden" : ""}>
                  <DiamondCard diamond={d} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      <MobileStoneBar diamond={diamond} watchId="stone-actions" />
    </div>
  );
}
