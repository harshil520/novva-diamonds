"use client";

import React, { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Search } from "lucide-react";
import { FAQ_ITEMS, type FAQItem } from "@/data/faq";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/config";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { TextReveal, Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";

type CategoryFilter = "all" | FAQItem["category"];

const CATEGORIES: { key: CategoryFilter; label: string; tag: string }[] = [
  { key: "all", label: "All questions", tag: "" },
  { key: "shipping", label: "International shipping", tag: "Armoured logistics" },
  { key: "certification", label: "GIA & IGI certification", tag: "Gemological audit" },
  { key: "bourse", label: "Surat Diamond Bourse", tag: "Trading floor" },
];

export default function FAQ() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({ "shipping-insurance": true });
  const searchId = useId();

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_ITEMS.filter(
      (item) =>
        (category === "all" || item.category === category) &&
        (!q ||
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.keyHighlight?.toLowerCase().includes(q))
    );
  }, [category, query]);

  return (
    <section id="faq" className="scroll-mt-24 border-t border-line py-24 sm:py-32" aria-label="Frequently asked questions">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="eyebrow">Buyer assurance</p>
            </Reveal>
            <TextReveal segments={["Questions,", { em: "answered." }]} className="display mt-5 text-[clamp(2.3rem,4.8vw,4.2rem)] leading-[1]" />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-mute">
                Armoured logistics, laboratory verification and buying direct on the Surat trading floor.
              </p>

              <div className="relative mt-8 max-w-sm">
                <label htmlFor={searchId} className="sr-only">
                  Search questions
                </label>
                <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" strokeWidth={1.5} />
                <input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search shipping, GIA, payment…"
                  className="h-11 w-full border-b border-line-strong bg-transparent pl-7 text-[14px] outline-none transition-colors placeholder:text-faint focus:border-ink"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 lg:flex-col lg:items-start lg:gap-1" role="tablist" aria-label="Question topics">
                {CATEGORIES.map((c) => {
                  const count = c.key === "all" ? FAQ_ITEMS.length : FAQ_ITEMS.filter((i) => i.category === c.key).length;
                  const on = category === c.key;
                  return (
                    <button
                      key={c.key}
                      role="tab"
                      aria-selected={on}
                      onClick={() => setCategory(c.key)}
                      className={cn(
                        "flex items-center gap-3 rounded-full border px-4 py-2 text-[13px] transition-colors duration-300 lg:rounded-none lg:border-0 lg:px-0 lg:py-1.5",
                        on ? "border-ink bg-ink text-ivory lg:bg-transparent lg:text-ink" : "border-line text-mute hover:text-ink"
                      )}
                    >
                      <span className={cn("hidden h-px transition-all duration-500 lg:block", on ? "w-8 bg-ink" : "w-3 bg-line-strong")} />
                      {c.label}
                      <span className="numeric text-[11px] opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <ul className="border-t border-line">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((item) => {
                const isOpen = !!open[item.id];
                const tag = CATEGORIES.find((c) => c.key === item.category)?.tag;
                return (
                  <motion.li
                    layout
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE_LUXE }}
                    className="border-b border-line"
                  >
                    <button
                      type="button"
                      onClick={() => setOpen((o) => ({ ...o, [item.id]: !o[item.id] }))}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${item.id}`}
                      className="group flex w-full items-start gap-6 py-6 text-left sm:py-7"
                    >
                      <span className="flex-1">
                        <span className="eyebrow block text-[10px]">{tag}</span>
                        <span className="display mt-2 block text-[1.3rem] leading-snug sm:text-[1.55rem]">{item.question}</span>
                      </span>
                      <span
                        className={cn(
                          "mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-[var(--ease-luxe)]",
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
                          <div className="max-w-2xl pb-8 pr-4 sm:pr-12">
                            <p className="text-[15px] leading-relaxed text-ink-soft/85">{item.answer}</p>
                            {item.keyHighlight && (
                              <p className="mt-5 inline-flex items-center gap-3 text-[12.5px] font-medium">
                                <span className="h-px w-6 bg-champagne" />
                                {item.keyHighlight}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {items.length === 0 && (
            <div className="py-14 text-center">
              <p className="display text-2xl">No question matches that search.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
                className="link-draw mt-4 text-[13.5px] font-medium"
              >
                Reset filters
              </button>
            </div>
          )}

          <Reveal className="mt-12 flex flex-col gap-5 rounded-[24px] bg-porcelain/80 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-[15px] font-medium">Something more specific?</p>
              <p className="mt-1 text-[13.5px] text-mute">Quotations, 40× videos and lab checks — usually within minutes.</p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <a
                href={getConciergeWhatsAppUrl({ topic: "general" })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-medium text-ivory"
              >
                <WhatsAppIcon size={15} /> Ask on WhatsApp
              </a>
              <a href={`mailto:${siteConfig.contact.email}?subject=Diamond%20Question%20-%20Novva%20Diamonds`} className="link-draw text-[13px] font-medium">
                Email the desk
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
