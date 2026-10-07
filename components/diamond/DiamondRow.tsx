"use client";

import React from "react";
import Link from "next/link";
import type { Diamond } from "@/types/diamond";
import { useCurrency } from "@/context/CurrencyContext";
import { getDiamondWhatsAppUrl } from "@/lib/whatsapp";
import DiamondPhoto from "./DiamondPhoto";
import { originLabel } from "./DiamondCard";
import { WhatsAppIcon } from "@/components/ui/icons";
import { ArrowGlyph } from "@/components/ui/Button";

/** Compact comparison row for the list view of the collection. */
export default function DiamondRow({ diamond }: { diamond: Diamond }) {
  const { formatPrice } = useCurrency();
  return (
    <div className="group relative grid grid-cols-[56px_1fr_auto] items-center gap-4 border-b border-line py-4 transition-colors duration-300 hover:bg-paper/70 md:grid-cols-[64px_1.6fr_repeat(5,minmax(0,0.7fr))_1fr_auto] md:gap-5 md:px-3">
      <div className="h-14 w-14 rounded-xl bg-porcelain p-2 md:h-16 md:w-16">
        <DiamondPhoto shape={diamond.shape} alt="" sizes="64px" />
      </div>
      <div className="min-w-0">
        <Link href={`/diamonds/${diamond.id}`} className="after:absolute after:inset-0">
          <span className="display block text-[1.15rem] leading-tight">
            {diamond.carat.toFixed(2)} ct {diamond.shape}
          </span>
        </Link>
        <span className="numeric mt-1 block text-[11.5px] text-mute">
          {diamond.id}
          <span className="md:hidden">
            {" "}· {diamond.color} · {diamond.clarity} · {diamond.certification.laboratory}
          </span>
        </span>
      </div>
      <Cell label="Colour" value={diamond.color} />
      <Cell label="Clarity" value={diamond.clarity} />
      <Cell label="Cut" value={diamond.cut} />
      <Cell label="Lab" value={diamond.certification.laboratory} />
      <Cell label="Origin" value={originLabel(diamond.origin)} />
      <p className="numeric text-right text-[14.5px] font-medium md:text-left">{formatPrice(diamond.indicativePriceUSD)}</p>
      <div className="relative z-10 hidden items-center gap-2 md:flex">
        <a
          href={getDiamondWhatsAppUrl(diamond)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Enquire about ${diamond.id} on WhatsApp`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink hover:bg-ink hover:text-ivory"
        >
          <WhatsAppIcon size={14} />
        </a>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-ivory">
          <ArrowGlyph />
        </span>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="hidden md:block">
      <span className="block text-[10.5px] uppercase tracking-[0.14em] text-faint">{label}</span>
      <span className="mt-0.5 block text-[13.5px]">{value}</span>
    </div>
  );
}
