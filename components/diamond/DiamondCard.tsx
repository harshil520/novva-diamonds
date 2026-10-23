"use client";

import React from "react";
import Link from "next/link";
import type { Diamond } from "@/types/diamond";
import { getDiamondWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import DiamondPhoto from "./DiamondPhoto";
import { WhatsAppIcon } from "@/components/ui/icons";
import { ArrowGlyph } from "@/components/ui/Button";

export function originLabel(origin: Diamond["origin"]) {
  return origin === "Lab-Grown" ? "Lab-grown" : "Natural";
}

export default function DiamondCard({ diamond, priority, className }: { diamond: Diamond; priority?: boolean; className?: string }) {
  const unavailable = diamond.availability && diamond.availability !== "Available";

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/diamonds/${diamond.id}`} className="block" aria-label={`${diamond.carat.toFixed(2)} carat ${diamond.shape} diamond, ${diamond.color} ${diamond.clarity}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-porcelain transition-colors duration-700 group-hover:bg-mist/70 sm:rounded-[24px]">
          {/* soft studio light pool */}
          <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_42%,rgb(255_255_255/0.95),transparent_70%)] opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
          {/* contact shadow */}
          <div className="absolute left-1/2 top-[66%] h-[5%] w-[40%] -translate-x-1/2 rounded-[50%] bg-ink/10 blur-md transition-all duration-700 group-hover:w-[34%] group-hover:bg-ink/[0.07]" />

          <div className="absolute left-3.5 right-3.5 top-3.5 flex items-start justify-between text-[10.5px] font-medium uppercase tracking-[0.16em] text-mute sm:left-5 sm:right-5 sm:top-5">
            <span>{originLabel(diamond.origin)}</span>
            <span className="text-ink-soft">{diamond.certification.laboratory}</span>
          </div>

          <div className="absolute inset-x-[16%] top-[17%] aspect-square transition-transform duration-[1.2s] ease-[var(--ease-luxe)] group-hover:-translate-y-[4%] group-hover:rotate-[6deg] group-hover:scale-[1.06]">
            <DiamondPhoto
              shape={diamond.shape}
              alt=""
              sizes="(max-width: 640px) 40vw, (max-width: 1280px) 22vw, 260px"
              priority={priority}
            />
          </div>

          {unavailable && (
            <span className="absolute bottom-4 left-4 rounded-full bg-ink px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.14em] text-ivory">
              {diamond.availability}
            </span>
          )}

          <span className="absolute bottom-4 right-4 hidden translate-y-2 items-center gap-1.5 rounded-full bg-paper px-3.5 py-2 text-[12px] font-medium text-ink opacity-0 shadow-sm transition-all duration-500 ease-[var(--ease-luxe)] group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
            View <ArrowGlyph />
          </span>
        </div>

        <div className="mt-3.5 flex items-start justify-between gap-3 px-0.5 sm:mt-4">
          <div className="min-w-0">
            <h3 className="display text-[1.05rem] leading-tight sm:text-[1.35rem]">
              {diamond.carat.toFixed(2)} ct {diamond.shape}
            </h3>
            <p className="numeric mt-1 truncate text-[12px] text-mute sm:text-[12.5px]">
              {diamond.color} · {diamond.clarity} · {diamond.cut}
            </p>
          </div>
        </div>
      </Link>

      <a
        href={getDiamondWhatsAppUrl(diamond)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Enquire about ${diamond.id} on WhatsApp`}
        title="Enquire on WhatsApp"
        className="absolute right-4 top-12 hidden h-9 w-9 items-center justify-center rounded-full bg-paper text-ink opacity-0 shadow-sm transition-all duration-500 hover:bg-ink hover:text-ivory focus:opacity-100 group-hover:opacity-100 sm:flex"
      >
        <WhatsAppIcon size={15} />
      </a>
    </article>
  );
}
