"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import { EASE_LUXE } from "@/lib/motion";
import { WhatsAppIcon } from "@/components/ui/icons";

/** Floating WhatsApp concierge with a contextual, dismissible prompt. */
export default function ConciergeButton() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Offer the prompt once the visitor has started exploring, not over the first screen
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.9) {
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/contact") return null;
  // The stone page carries its own sticky action bar on mobile
  const onStonePage = /^\/diamonds\/[^/]+$/.test(pathname);

  let topic: "catalog" | "general" = "general";
  let label = "Speak with a specialist";
  if (pathname.startsWith("/diamonds")) {
    topic = "catalog";
    label = "Need help choosing?";
  } else if (pathname.startsWith("/education")) {
    label = "Ask a gemologist";
  }

  return (
    <div className={`fixed bottom-5 right-5 z-40 flex items-center gap-3 sm:bottom-7 sm:right-7 ${onStonePage ? "max-lg:hidden" : ""}`}>
      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.6, ease: EASE_LUXE }}
            className="hidden items-center gap-2 rounded-full border border-line bg-paper py-1.5 pl-4 pr-1.5 text-[12.5px] text-ink-soft shadow-[0_12px_40px_-16px_rgb(18_18_18/0.35)] sm:flex"
          >
            {label}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="flex h-6 w-6 items-center justify-center rounded-full text-mute hover:bg-ink/5 hover:text-ink"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href={getConciergeWhatsAppUrl({ topic })}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message Novva Diamonds on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.7, ease: EASE_LUXE }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-ink text-ivory shadow-[0_18px_40px_-14px_rgb(18_18_18/0.6)]"
      >
        <WhatsAppIcon size={22} />
        <span className="absolute right-0.5 top-0.5 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3fbf7f] opacity-50" />
          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-ink bg-[#3fbf7f]" />
        </span>
      </motion.a>
    </div>
  );
}
