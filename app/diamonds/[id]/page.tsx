import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import DiamondViewer from "@/components/diamond/DiamondViewer";
import DiamondCard from "@/components/diamond/DiamondCard";
import { StoneActions, CertificateCard, MobileStoneBar } from "@/components/diamond/StoneActions";
import { stoneMailto } from "@/lib/mailto";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink, ArrowGlyph } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { diamondsData } from "@/data/diamonds";
import { getDiamondWhatsAppUrl } from "@/lib/whatsapp";
import { getShapeProfile } from "@/lib/shapes";
import PriceDisplay from "./PriceDisplay";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return diamondsData.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const diamond = diamondsData.find((d) => d.id === id);
  if (!diamond) return { title: "Diamond Not Found | Novva Diamonds" };

  return {
    title: `${diamond.carat.toFixed(2)}ct ${diamond.shape} ${diamond.origin} Diamond — ${diamond.color} ${diamond.clarity} ${diamond.certification.laboratory} | Novva Diamonds`,
    description: `Inspect certified ${diamond.carat.toFixed(2)}ct ${diamond.shape} ${diamond.origin} diamond. ${diamond.color} Color, ${diamond.clarity} Clarity, ${diamond.cut} Cut. Certified by ${diamond.certification.laboratory} (${diamond.certification.certificateNumber}). Direct export from Surat Diamond Bourse.`,
  };
}

const COLOR_NOTE: Record<string, string> = {
  D: "Colourless",
  E: "Colourless",
  F: "Colourless",
  G: "Near colourless",
  H: "Near colourless",
  I: "Faint warmth",
  J: "Faint warmth",
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

  const profile = getShapeProfile(diamond.shape);
  const ratio = diamond.ratio ?? +(diamond.dimensions.length / diamond.dimensions.width).toFixed(2);

  const fourCs = [
    { k: "Carat", v: diamond.carat.toFixed(2), note: `${diamond.dimensions.length} × ${diamond.dimensions.width} mm` },
    { k: "Colour", v: diamond.color, note: COLOR_NOTE[diamond.color] },
    { k: "Clarity", v: diamond.clarity, note: CLARITY_NOTE[diamond.clarity] },
    { k: "Cut", v: diamond.cut, note: `${diamond.polish ?? "Excellent"} polish` },
  ];

  const dossier: [string, string, string?][] = [
    ["Measurements", `${diamond.dimensions.length} × ${diamond.dimensions.width} × ${diamond.dimensions.depth} mm`, "Length × width × depth"],
    ["Table", `${diamond.tablePercentage || 58}%`, "Of average girdle diameter"],
    ["Depth", `${diamond.depthPercentage || 61.5}%`, "Ideal optical return band"],
    ["Length / width ratio", ratio.toFixed(2), `Typical for ${diamond.shape}: ${profile.ratio}`],
    ["Polish", diamond.polish || "Excellent", "Master facet polish in Surat"],
    ["Symmetry", diamond.symmetry || "Excellent", "Facet alignment & balance"],
    ["Fluorescence", diamond.fluorescence || "None", "No UV hazing or cloudiness"],
    ["Origin", diamond.origin === "Lab-Grown" ? "Laboratory-grown" : "Natural, earth-mined", diamond.origin === "Lab-Grown" ? "Type IIa, CVD / HPHT" : "Kimberley Process compliant"],
    ["Laboratory", diamond.certification.laboratory, `Report ${diamond.certification.certificateNumber}`],
    ["Laser inscription", diamond.certification.inscribed === false ? "Not inscribed" : "Inscribed on girdle", `${diamond.certification.laboratory} ${diamond.certification.certificateNumber}`],
  ];

  return (
    <div className="pb-16 pt-[72px]">
      <div className="shell">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 py-6 text-[12px] text-mute">
          <Link href="/" className="link-draw hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/diamonds" className="link-draw hover:text-ink">
            Collection
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/diamonds?shape=${diamond.shape}`} className="link-draw hover:text-ink">
            {diamond.shape}
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
              <span>{diamond.origin === "Lab-Grown" ? "Lab-grown" : "Natural"} · {diamond.certification.laboratory} certified</span>
              <span className="numeric">Ref {diamond.id}</span>
            </div>
            <h1 className="display mt-4 text-[clamp(2.6rem,5vw,4.2rem)] leading-[0.98]">
              {diamond.carat.toFixed(2)} carat
              <br />
              <em>{diamond.shape}</em>
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

            <div className="mt-8">
              <PriceDisplay indicativePriceUSD={diamond.indicativePriceUSD} />
            </div>

            <div id="stone-actions" className="mt-8">
              <StoneActions diamond={diamond} />
            </div>

            <div className="mt-8">
              <CertificateCard diamond={diamond} />
            </div>

            <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-[11.5px] leading-snug text-mute">
              {["GIA / IGI inscribed", "Triple Excellent standard", "Insured armoured air"].map((t) => (
                <li key={t} className="rounded-2xl border border-line px-2 py-4">
                  <span className="mx-auto mb-2 block h-px w-5 bg-champagne" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dossier */}
        <section className="mt-24 border-t border-line pt-16 sm:mt-32" aria-labelledby="dossier">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow">Gemological dossier</p>
              <h2 id="dossier" className="display mt-4 text-[2.4rem] leading-[1.02] sm:text-[3rem]">
                Every measure, <em>on record.</em>
              </h2>
              <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-mute">{profile.character}</p>
            </Reveal>
            <dl className="grid sm:grid-cols-2 lg:col-span-8 lg:gap-x-10">
              {dossier.map(([k, v, note], i) => (
                <Reveal key={k} delay={(i % 2) * 0.05} className="flex items-baseline justify-between gap-6 border-t border-line py-5">
                  <div>
                    <dt className="text-[13px] text-mute">{k}</dt>
                    {note && <dd className="mt-1 text-[11.5px] text-faint">{note}</dd>}
                  </div>
                  <dd className="numeric text-right text-[15px] font-medium">{v}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* Concierge */}
        <Reveal className="mt-24 overflow-hidden rounded-[32px] bg-ink px-7 py-12 text-ivory sm:px-14 sm:py-16">
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow text-ivory/50">Private buyer concierge</p>
              <h2 className="display mt-4 text-[2.3rem] leading-[1.02] sm:text-[3.2rem]">
                Enquire about stone <em className="numeric">{diamond.id}</em>
              </h2>
              <p className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-ivory/60">
                Speak directly with our Surat vault desk for a high-magnification microscope video, the PDF certificate,
                and an insured CIF delivery quote to your city.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <a
                href={getDiamondWhatsAppUrl(diamond)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-ivory px-7 text-[14px] font-medium text-ink"
              >
                <WhatsAppIcon size={17} /> Chat on WhatsApp <ArrowGlyph diagonal />
              </a>
              <a
                href={stoneMailto(diamond)}
                className="inline-flex h-14 items-center justify-center rounded-full border border-ivory/25 px-7 text-[14px] font-medium transition-colors hover:border-ivory"
              >
                Email vault desk
              </a>
            </div>
          </div>
        </Reveal>

        {/* Similar */}
        {similarDiamonds.length > 0 && (
          <section className="mt-24 sm:mt-32" aria-labelledby="similar">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Comparable stones</p>
                <h2 id="similar" className="display mt-3 text-[2.2rem] sm:text-[2.8rem]">
                  You may also <em>consider</em>
                </h2>
              </div>
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
