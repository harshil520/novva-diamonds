import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/config";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import { ArrowGlyph } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";

const columns = [
  {
    title: "Collection",
    links: [
      { label: "Natural diamonds", href: "/diamonds?origin=Natural" },
      { label: "Lab-grown diamonds", href: "/diamonds?origin=Lab-Grown" },
      { label: "Round brilliant", href: "/diamonds?shape=Round" },
      { label: "Fancy shapes", href: "/diamonds?shape=Oval" },
      { label: "Full collection", href: "/diamonds" },
    ],
  },
  {
    title: "Knowledge",
    links: [
      { label: "The 4Cs", href: "/education/4cs" },
      { label: "GIA & IGI verification", href: "/education/certification" },
      { label: "Natural vs lab-grown", href: "/education/natural-vs-lab-grown" },
      { label: "Surat heritage", href: "/about" },
      { label: "Questions & answers", href: "/#faq" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const whatsappUrl = getConciergeWhatsAppUrl({ topic: "general" });

  return (
    <footer className="relative overflow-hidden border-t border-line bg-porcelain/60">
      <div className="shell pt-20 sm:pt-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="display max-w-md text-[2.2rem] leading-[1.05] sm:text-[2.8rem]">
              {siteConfig.brand.tagline.split(". ")[0]}.
              <br />
              <em>{siteConfig.brand.tagline.split(". ")[1]}</em>
            </p>
            <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-mute">
              A private diamond house within the Surat Diamond Bourse, cutting and certifying natural and lab-grown
              stones for jewellers and private clients worldwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-medium text-ivory"
              >
                <WhatsAppIcon size={15} /> WhatsApp concierge
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-ink/20 px-5 text-[13px] font-medium transition-colors hover:border-ink"
              >
                Email the desk <ArrowGlyph diagonal />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="eyebrow">{col.title}</h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link-draw text-[14px] text-ink-soft hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="eyebrow">Concierge</h3>
              <ul className="mt-5 space-y-3 text-[14px] text-ink-soft">
                <li>
                  <a href={`mailto:${siteConfig.contact.email}`} className="link-draw hover:text-ink">
                    {siteConfig.contact.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`} className="link-draw hover:text-ink">
                    {siteConfig.contact.phone}
                  </a>
                </li>
                <li className="text-mute">Replies {siteConfig.contact.averageResponseTime}</li>
                <li>
                  <Link href="/contact" className="link-draw hover:text-ink">
                    Custom sourcing request
                  </Link>
                </li>
              </ul>
              <p className="mt-6 text-[12.5px] leading-relaxed text-mute">{siteConfig.brand.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-4 border-t border-line py-6 text-[12px] text-mute md:grid-cols-2">
          <p>
            <span className="text-ink-soft">Secured delivery to</span> United States · Canada · Australia · Europe & UK ·
            Kazakhstan · India
          </p>
          <p className="md:text-right">Insured couriers: Brink’s · Malca-Amit · Ferrari Express</p>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the page edge */}
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <p className="display translate-y-[18%] text-center text-[25vw] leading-[0.8] tracking-[0.08em] text-ink/[0.06]">
          NOVVA
        </p>
      </div>
      <div className="shell flex flex-col gap-2 border-t border-line py-6 text-[11.5px] text-mute sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Novva Diamonds. Surat, Gujarat, India.</p>
        <p>Direct sourcing & export · GIA & IGI graded inventory</p>
      </div>
    </footer>
  );
}
