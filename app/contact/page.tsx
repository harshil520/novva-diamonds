import React from "react";
import { Metadata } from "next";
import { Mail, MapPin, Clock, Phone, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/config";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import PageHeader from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import EnquiryForm from "@/components/diamond/EnquiryForm";
import { WhatsAppIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contact Novva Diamonds | Direct Surat Diamond Export Concierge",
  description:
    "Connect directly with Novva Diamonds at the Surat Diamond Bourse via WhatsApp, direct phone, or email for certified loose diamond pricing, custom sourcing, and armored export logistics.",
};

const SOURCING_MAIL = `mailto:${siteConfig.contact.email}?subject=Diamond%20Sourcing%20Inquiry%20-%20Novva%20Diamonds&body=Hello%20Novva%20Diamonds%20Team,%0A%0AI%20am%20interested%20in%20sourcing%20a%20certified%20diamond%20with%20the%20following%20specifications:%0A-%20Shape:%0A-%20Carat%20Range:%0A-%20Color:%0A-%20Clarity:%0A-%20Certification%20(GIA/IGI):%0A-%20Destination%20City/Country:%0A%0AThank%20you.`;

export default function ContactPage() {
  const whatsappUrl = getConciergeWhatsAppUrl({ topic: "general" });
  const tel = (siteConfig.contact.phone || siteConfig.contact.whatsappNumber).replace(/[^0-9+]/g, "");

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Private client & jeweller concierge"
        title={["Let’s find", { em: "the right diamond." }]}
        intro="Tell us what you are looking for. We will match it from our Surat vault, or source it fresh from the trading floor."
      />

      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-12">
        {/* Channels */}
        <div className="space-y-4 lg:col-span-5">
          <Reveal>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-[28px] bg-ink p-8 text-ivory transition-shadow duration-500 hover:shadow-[0_30px_80px_-30px_rgb(18_18_18/0.7)] sm:p-10"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-ink">
                  <WhatsAppIcon size={22} />
                </span>
                <ArrowUpRight className="h-5 w-5 text-ivory/50 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ivory" strokeWidth={1.3} />
              </div>
              <p className="eyebrow mt-10 text-ivory/50">Fastest response</p>
              <h2 className="display mt-3 text-[2.2rem] leading-none">WhatsApp concierge</h2>
              <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-ivory/60">
                Quotations, high-magnification videos and live availability — straight from our lead specialist. Send
                exact carat, shape, ratio or budget for a live lookup.
              </p>
              <p className="mt-8 flex items-center gap-2 text-[12.5px] text-ivory/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3fbf7f]" /> Typical reply {siteConfig.contact.averageResponseTime}
              </p>
            </a>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Reveal delay={0.06}>
              <a href={SOURCING_MAIL} className="group block h-full rounded-[24px] border border-line bg-paper p-6 transition-colors duration-500 hover:border-ink/40">
                <Mail className="h-5 w-5" strokeWidth={1.3} />
                <p className="mt-6 text-[15px] font-medium">Official email</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-mute">Proforma invoices, lab dossiers and custom parcel quotes.</p>
                <p className="mt-4 break-all text-[13px] font-medium link-draw">{siteConfig.contact.email}</p>
              </a>
            </Reveal>
            <Reveal delay={0.1}>
              <a href={`tel:${tel}`} className="group block h-full rounded-[24px] border border-line bg-paper p-6 transition-colors duration-500 hover:border-ink/40">
                <Phone className="h-5 w-5" strokeWidth={1.3} />
                <p className="mt-6 text-[15px] font-medium">Export desk phone</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-mute">Call the export desk during trading hours.</p>
                <p className="numeric mt-4 text-[13px] font-medium">{siteConfig.contact.phone || siteConfig.contact.whatsappDisplay}</p>
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="rounded-[24px] border border-line p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.3} />
              <div>
                <p className="text-[15px] font-medium">Surat headquarters & vault</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-mute">{siteConfig.brand.address}</p>
                <p className="mt-3 flex items-center gap-2 text-[12.5px] text-mute">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.4} /> {siteConfig.contact.workingHours}
                </p>
              </div>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-[13px] font-medium">Bourse floor & vault viewings</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-mute">
                Registered jewellers, wholesale buyers and private clients may inspect stones in person in our secured
                viewing suites.
              </p>
              <ul className="mt-4 grid gap-2 text-[12.5px] text-ink-soft sm:grid-cols-2">
                {["Prior 24-hour gate clearance", "Gemological loupe & UV desk", "Escrow & wire settlement", "Customs-cleared armoured dispatch"].map((x) => (
                  <li key={x} className="flex items-center gap-2.5">
                    <span className="h-px w-3 bg-champagne" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-[13px] font-medium">Insured export corridors</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-mute">
                United States, Canada, Australia, European Union, United Kingdom, Kazakhstan and domestic India — via
                Brink’s Global, Malca-Amit and Ferrari Express.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          <Reveal delay={0.08} className="rounded-[32px] border border-line bg-paper p-6 sm:p-10 lg:sticky lg:top-24">
            <p className="eyebrow">Bespoke sourcing desk</p>
            <h2 className="display mt-4 text-[2.2rem] leading-[1.02] sm:text-[2.8rem]">
              Send a <em>private enquiry</em>
            </h2>
            <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-mute">
              Instant quotes, 360° videos, certificate PDFs and tailored parcel sourcing — without third-party markups.
            </p>
            <div className="mt-9">
              <EnquiryForm topic="Custom Sourcing" />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
