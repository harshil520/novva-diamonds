"use client";

import React from "react";
import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { TextReveal, Reveal } from "@/components/ui/Reveal";
import { ArrowGlyph } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/config";
import { useUI } from "@/components/providers/UIProvider";
import { EASE_LUXE } from "@/lib/motion";

const SOURCING_MAIL = `mailto:${siteConfig.contact.email}?subject=Diamond%20Request&body=Hello%20Novva%20Diamonds,%0A%0AI%20am%20looking%20for:%0A-%20Natural%20or%20lab-grown:%0A-%20Shape:%0A-%20Carat:%0A-%20Colour%20/%20clarity:%0A-%20Certificate%20(GIA%20/%20IGI):%0A-%20Delivery%20country:%0A%0AThank%20you.`;

export default function Concierge() {
  const { openEnquiry } = useUI();

  const options = [
    {
      icon: <WhatsAppIcon size={20} />,
      title: "WhatsApp us",
      body: "Fastest reply. Send the shape, carat and quality you want.",
      href: getConciergeWhatsAppUrl({ topic: "sourcing" }),
    },
    {
      icon: <Mail className="h-5 w-5" strokeWidth={1.3} />,
      title: "Email us",
      body: "Send your full requirements and we will reply with options.",
      href: SOURCING_MAIL,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-ivory sm:py-36" aria-label="Request a diamond">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.07),transparent)]" />
      <div className="shell relative">
        <div className="mx-auto max-w-3xl text-center">
          <TextReveal
            segments={["Can't find the", { em: "right diamond?" }]}
            className="display text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.98]"
          />
          <Reveal delay={0.12}>
            <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-relaxed text-ivory/60">
              Tell us what you need and we will find it for you.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2">
          {options.map((o, i) => (
            <motion.a
              key={o.title}
              href={o.href}
              target={o.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, delay: i * 0.1, ease: EASE_LUXE }}
              className="group flex flex-col rounded-[28px] border border-ivory/15 p-8 transition-colors duration-500 hover:border-ivory/50 hover:bg-ivory/[0.04] sm:p-10"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-ink">{o.icon}</span>
                <ArrowGlyph diagonal className="h-5 w-5 text-ivory/50 group-hover:text-ivory" />
              </div>
              <h3 className="display mt-10 text-[1.9rem] leading-tight">{o.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-ivory/60">{o.body}</p>
            </motion.a>
          ))}
        </div>

        <Reveal className="mx-auto mt-10 flex max-w-5xl justify-center border-t border-ivory/15 pt-8 text-[13px]">
          <button
            type="button"
            onClick={() => openEnquiry({ topic: "Custom Sourcing" })}
            className="group inline-flex items-center gap-2 font-medium text-ivory"
          >
            <span className="link-draw">Or fill in the enquiry form</span> <ArrowGlyph />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
