"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencySelect from "@/components/layout/CurrencySelect";

interface PriceDisplayProps {
  indicativePriceUSD: number;
}

export default function PriceDisplay({ indicativePriceUSD }: PriceDisplayProps) {
  const { formatPrice, currentCurrency } = useCurrency();

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-mute">Indicative export price · FOB Surat</span>
        <CurrencySelect />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={currentCurrency}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="display numeric mt-1 text-[2.6rem] leading-none sm:text-[3rem]"
        >
          {formatPrice(indicativePriceUSD)}
        </motion.p>
      </AnimatePresence>
      <p className="mt-3 max-w-md text-[12px] leading-relaxed text-faint">
        Indicative, based on current market rates. The final proforma invoice is issued in USD or INR for bank wire or
        escrow upon confirmation.
      </p>
    </div>
  );
}
