"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { FAQ_ITEMS } from "@/data/faq";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { TextReveal, Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";

export default function FAQ() {
  const [open, setOpen] = useState<Record<string, boolean>>({ "shipping-insurance": true });

  return (
    <section id="faq" className="scroll-mt-24 border-t border-line py-24 sm:py-32" aria-label="Frequently asked questions">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <TextReveal segments={["Common", { em: "questions" }]} className="display text-[clamp(2.3rem,4.8vw,4.2rem)] leading-[1]" />
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <ul className="border-t border-line">
            {FAQ_ITEMS.map((item) => {
              const isOpen = !!open[item.id];
              return (
                <li key={item.id} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [item.id]: !o[item.id] }))}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${item.id}`}
                    className="group flex w-full items-center gap-6 py-6 text-left"
                  >
                    <span className="display flex-1 text-[1.3rem] leading-snug sm:text-[1.5rem]">{item.question}</span>
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-[var(--ease-luxe)]",
                        isOpen ? "rotate-45 border-ink bg-ink text-ivory" : "border-line group-hover:border-ink"
                      )}
                    >
                      <Plus className="h-4 w-4" strokeWidth={1.4} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-${item.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: EASE_LUXE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 pr-4 text-[15px] leading-relaxed text-ink-soft/85 sm:pr-12">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          <Reveal className="mt-12 flex flex-col gap-5 rounded-[24px] bg-porcelain/80 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="text-[15px] font-medium">Have another question?</p>
            <a
              href={getConciergeWhatsAppUrl({ topic: "general" })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-ink px-5 text-[13px] font-medium text-ivory sm:self-auto"
            >
              <WhatsAppIcon size={15} /> Ask on WhatsApp
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
