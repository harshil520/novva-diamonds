import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/config";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import { ArrowGlyph } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";

const columns = [
  {
    title: "Diamonds",
    links: [
      { label: "Natural diamonds", href: "/diamonds?origin=Natural" },
      { label: "Lab-grown diamonds", href: "/diamonds?origin=Lab-Grown" },
      { label: "All diamonds", href: "/diamonds" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "The 4Cs", href: "/education/4cs" },
      { label: "Checking a certificate", href: "/education/certification" },
      { label: "Natural vs lab-grown", href: "/education/natural-vs-lab-grown" },
      { label: "FAQ", href: "/#faq" },
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
            <p className="display max-w-md text-[2.2rem] leading-[1.05] sm:text-[2.6rem]">{siteConfig.brand.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-medium text-ivory"
              >
                <WhatsAppIcon size={15} /> WhatsApp us
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-ink/20 px-5 text-[13px] font-medium transition-colors hover:border-ink"
              >
                Email us <ArrowGlyph diagonal />
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
              <h3 className="eyebrow">Contact</h3>
              <ul className="mt-5 space-y-3 text-[14px] text-ink-soft">
                <li>
                  <a href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`} className="link-draw hover:text-ink">
                    {siteConfig.contact.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${siteConfig.contact.email}`} className="link-draw break-all hover:text-ink">
                    {siteConfig.contact.email}
                  </a>
                </li>
              </ul>
              <p className="mt-6 text-[12.5px] leading-relaxed text-mute">{siteConfig.brand.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the page edge */}
      <div aria-hidden="true" className="pointer-events-none mt-16 select-none overflow-hidden">
        <p className="display translate-y-[18%] text-center text-[25vw] leading-[0.8] tracking-[0.08em] text-ink/[0.06]">
          NOVVA
        </p>
      </div>
      <div className="shell border-t border-line py-6 text-[11.5px] text-mute">
        <p>© {year} Novva Diamonds, Surat, India.</p>
      </div>
    </footer>
  );
}
