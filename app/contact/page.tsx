import React from "react";
import { Metadata } from "next";
import { Mail, MapPin, Clock, Phone, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/config";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import PageHeader from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import EnquiryForm from "@/components/diamond/EnquiryForm";
import { WhatsAppIcon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Novva Diamonds | Surat Diamond Bourse, India",
  description:
    "Contact Novva Diamonds at the Surat Diamond Bourse by WhatsApp, phone or email. Mon to Sat, 9:30 am to 7:30 pm IST. Most replies within 15 minutes.",
  path: "/contact",
  absoluteTitle: true,
});

const SOURCING_MAIL = `mailto:${siteConfig.contact.email}?subject=Diamond%20Enquiry%20-%20Novva%20Diamonds&body=Hello%20Novva%20Diamonds,%0A%0AI%20am%20looking%20for:%0A-%20Shape:%0A-%20Carat:%0A-%20Colour:%0A-%20Clarity:%0A-%20Certificate%20(GIA/IGI):%0A-%20Delivery%20country:%0A%0AThank%20you.`;

export default function ContactPage() {
  const whatsappUrl = getConciergeWhatsAppUrl({ topic: "general" });
  const tel = (siteConfig.contact.phone || siteConfig.contact.whatsappNumber).replace(/[^0-9+]/g, "");

  return (
    <div className="pb-24">
      <PageHeader title={["Contact", { em: "us" }]} intro="Tell us what you are looking for and we will help you find it." />

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
              <h2 className="display mt-10 text-[2.2rem] leading-none">WhatsApp</h2>
              <p className="numeric mt-3 text-[14px] text-ivory/70">{siteConfig.contact.whatsappDisplay}</p>
              <p className="mt-8 flex items-center gap-2 text-[12.5px] text-ivory/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3fbf7f]" /> {siteConfig.contact.averageResponseTime}
              </p>
            </a>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Reveal delay={0.06}>
              <a href={SOURCING_MAIL} className="group block h-full rounded-[24px] border border-line bg-paper p-6 transition-colors duration-500 hover:border-ink/40">
                <Mail className="h-5 w-5" strokeWidth={1.3} />
                <p className="mt-6 text-[15px] font-medium">Email</p>
                <p className="mt-2 break-all text-[13px] link-draw">{siteConfig.contact.email}</p>
              </a>
            </Reveal>
            <Reveal delay={0.1}>
              <a href={`tel:${tel}`} className="group block h-full rounded-[24px] border border-line bg-paper p-6 transition-colors duration-500 hover:border-ink/40">
                <Phone className="h-5 w-5" strokeWidth={1.3} />
                <p className="mt-6 text-[15px] font-medium">Phone</p>
                <p className="numeric mt-2 text-[13px]">{siteConfig.contact.phone || siteConfig.contact.whatsappDisplay}</p>
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="rounded-[24px] border border-line p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.3} />
              <div>
                <p className="text-[15px] font-medium">Office</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-mute">{siteConfig.brand.address}</p>
                <p className="mt-3 flex items-center gap-2 text-[12.5px] text-mute">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.4} /> {siteConfig.contact.workingHours}
                </p>
                <p className="mt-3 text-[12.5px] text-mute">Visits by appointment, booked 24 hours ahead.</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          <Reveal delay={0.08} className="rounded-[32px] border border-line bg-paper p-6 sm:p-10 lg:sticky lg:top-24">
            <h2 className="display text-[2.2rem] leading-[1.02] sm:text-[2.8rem]">
              Send an <em>enquiry</em>
            </h2>
            <div className="mt-9">
              <EnquiryForm topic="Custom Sourcing" />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
