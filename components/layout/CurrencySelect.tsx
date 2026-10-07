"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Check } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function CurrencySelect({ align = "right" }: { align?: "left" | "right" }) {
  const { currentCurrency, setCurrency, availableCurrencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Display prices in ${currentCurrency}. Change currency`}
        className="flex h-9 items-center gap-1 rounded-full px-3 text-[12.5px] font-medium tracking-wide text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
      >
        {currentCurrency}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} strokeWidth={1.5} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Currency"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE_LUXE }}
            className={cn(
              "absolute top-full z-50 mt-2 w-56 origin-top rounded-2xl border border-line bg-paper p-1.5 shadow-[0_24px_60px_-24px_rgb(18_18_18/0.35)]",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {Object.values(availableCurrencies).map((c) => {
              const selected = c.code === currentCurrency;
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setCurrency(c.code);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-colors",
                      selected ? "bg-porcelain text-ink" : "text-ink-soft hover:bg-porcelain/60"
                    )}
                  >
                    <span className="w-7 text-mute">{c.symbol}</span>
                    <span className="flex-1">
                      <span className="font-medium">{c.code}</span>
                      <span className="ml-2 text-[11.5px] text-mute">{c.name}</span>
                    </span>
                    {selected && <Check className="h-3.5 w-3.5" strokeWidth={1.8} />}
                  </button>
                </li>
              );
            })}
            <li className="px-3 pb-1.5 pt-2 text-[10.5px] leading-snug text-faint">Indicative conversion. Invoices in USD or INR.</li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
