"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Copy, ExternalLink, ShieldCheck } from "lucide-react";
import type { Diamond } from "@/types/diamond";
import { getDiamondWhatsAppUrl } from "@/lib/whatsapp";
import { stoneMailto } from "@/lib/mailto";
import { useUI } from "@/components/providers/UIProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button, ButtonLink, ArrowGlyph } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { EASE_LUXE } from "@/lib/motion";
import { useHydrated } from "@/hooks/use-hydrated";

/** Primary conversion block: WhatsApp, private enquiry form, email. */
export function StoneActions({ diamond }: { diamond: Diamond }) {
  const { openEnquiry } = useUI();
  return (
    <div className="space-y-3">
      <ButtonLink href={getDiamondWhatsAppUrl(diamond)} size="lg" className="w-full">
        <WhatsAppIcon size={17} /> Ask on WhatsApp
      </ButtonLink>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" className="w-full px-4" onClick={() => openEnquiry({ diamond })}>
          Send enquiry
        </Button>
        <ButtonLink href={stoneMailto(diamond)} variant="outline" size="lg" className="w-full px-4">
          Email us
        </ButtonLink>
      </div>
    </div>
  );
}

/** Grading report with official verification link and copy-to-clipboard. */
export function CertificateCard({ diamond }: { diamond: Diamond }) {
  const toast = useToast();
  const { laboratory, certificateNumber, verificationUrl, issueDate } = diamond.certification;

  const copy = () => {
    navigator.clipboard?.writeText(certificateNumber).then(
      () => toast({ tone: "success", title: "Report number copied", description: `${laboratory} ${certificateNumber}` }),
      () => toast({ tone: "error", title: "Could not copy", description: "Please select the number manually." })
    );
  };

  return (
    <div className="rounded-[22px] border border-line bg-paper p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-porcelain">
            <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.4} />
          </span>
          <div>
            <p className="text-[14px] font-medium">{laboratory} Diamond Grading Report</p>
            <button type="button" onClick={copy} className="group mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-mute hover:text-ink" title="Copy report number">
              <span className="numeric tracking-wide">No. {certificateNumber}</span>
              <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
            </button>
          </div>
        </div>
        {verificationUrl && (
          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-ink/20 px-3.5 text-[12px] font-medium transition-colors hover:border-ink hover:bg-ink hover:text-ivory"
          >
            Verify <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 text-[12.5px]">
        <div>
          <dt className="text-mute">Laser inscription</dt>
          <dd className="numeric mt-0.5 font-medium">
            {laboratory} {certificateNumber}
          </dd>
        </div>
        <div>
          <dt className="text-mute">Issued</dt>
          <dd className="mt-0.5 font-medium">
            {issueDate ? new Date(issueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "On file"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/** Mobile sticky WhatsApp bar, revealed after the primary actions scroll away. */
export function MobileStoneBar({ diamond, watchId }: { diamond: Diamond; watchId: string }) {
  const [show, setShow] = useState(false);
  const mounted = useHydrated();

  useEffect(() => {
    const el = document.getElementById(watchId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [watchId]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.6, ease: EASE_LUXE }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 lg:hidden"
        >
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">
                {diamond.carat.toFixed(2)} ct {diamond.shape} · {diamond.color} · {diamond.clarity}
              </p>
            </div>
            <a
              href={getDiamondWhatsAppUrl(diamond)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-medium text-ivory"
            >
              <WhatsAppIcon size={16} /> Ask <ArrowGlyph />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
