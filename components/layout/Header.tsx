"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Search } from "lucide-react";
import { siteConfig } from "@/config/config";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useUI } from "@/components/providers/UIProvider";
import CurrencySelect from "./CurrencySelect";
import { WhatsAppIcon } from "@/components/ui/icons";

export function useNavLinks() {
  const links = [
    { label: "Collection", href: "/diamonds" },
    { label: "Education", href: "/education" },
    { label: "Maison", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
  if (siteConfig.features.showJewelry) links.splice(1, 0, { label: "Jewellery", href: "/jewelry" });
  return links;
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex flex-col items-center leading-none", className)}>
      <span className="font-display text-[21px] font-light tracking-[0.34em] pl-[0.34em] sm:text-[23px]">NOVVA</span>
      <span className="mt-1 text-[8.5px] font-medium tracking-[0.5em] pl-[0.5em] text-mute">DIAMONDS</span>
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const links = useNavLinks();
  const { openSearch } = useUI();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 420 && y > prev + 2);
    if (y < prev - 2) setHidden(false);
  });

  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const whatsappUrl = getConciergeWhatsAppUrl({
    topic: pathname.startsWith("/diamonds") ? "catalog" : "general",
  });

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <motion.header
        animate={{ y: hidden && !menuOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE_LUXE }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || menuOpen
            ? "border-b border-line/80 bg-ivory/[0.97]"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="shell grid h-[72px] grid-cols-[1fr_auto_1fr] items-center">
          {/* Left: primary navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative text-[13px] tracking-[0.02em] transition-colors duration-300",
                  isActive(l.href) ? "text-ink" : "text-ink-soft/80 hover:text-ink"
                )}
              >
                {l.label}
                {isActive(l.href) && (
                  <motion.span layoutId="nav-active" className="absolute -bottom-1.5 left-0 right-0 h-px bg-ink" transition={{ duration: 0.5, ease: EASE_LUXE }} />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile: menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="-ml-2 flex h-10 w-10 items-center justify-center lg:hidden"
          >
            <span className="relative block h-3 w-5">
              <span className={cn("absolute left-0 top-0 h-px w-5 bg-ink transition-transform duration-500 ease-[var(--ease-luxe)]", menuOpen && "translate-y-1.5 rotate-45")} />
              <span className={cn("absolute bottom-0 left-0 h-px w-5 bg-ink transition-transform duration-500 ease-[var(--ease-luxe)]", menuOpen && "-translate-y-[5px] -rotate-45")} />
            </span>
          </button>

          {/* Centre: wordmark */}
          <Link href="/" aria-label="Novva Diamonds — home" className="justify-self-center text-ink">
            <Wordmark />
          </Link>

          {/* Right: utilities */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search diamonds"
              className="flex h-9 items-center gap-2 rounded-full px-2.5 text-[12.5px] text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink lg:border lg:border-line lg:pl-3.5 lg:pr-2"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden rounded border border-line bg-paper px-1.5 text-[10px] text-mute xl:inline">⌘K</kbd>
            </button>
            <div className="hidden sm:block">
              <CurrencySelect />
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn ml-1 hidden h-9 items-center gap-2 rounded-full bg-ink px-4 text-[12.5px] font-medium text-ivory transition-shadow duration-500 hover:shadow-[0_10px_30px_-12px_rgb(18_18_18/0.6)] md:inline-flex"
            >
              <WhatsAppIcon size={14} />
              Enquire
            </a>
          </div>
        </div>
      </motion.header>

      {/* Mobile / tablet full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
           
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: EASE_LUXE }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ivory pt-[72px] lg:hidden"
          >
            <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-center gap-1 py-10">
              {[{ label: "Home", href: "/" }, ...links].map((l, i) => (
                <div key={l.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.8, delay: 0.12 + i * 0.06, ease: EASE_LUXE }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-baseline gap-4 py-2"
                    >
                      <span className="numeric w-6 text-[11px] text-faint">0{i + 1}</span>
                      <span className={cn("display text-[2.6rem] sm:text-6xl", isActive(l.href) ? "font-normal" : "")}>{l.label}</span>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="shell space-y-5 border-t border-line py-8"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow">Currency</span>
                <CurrencySelect align="right" />
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-ink text-[14px] font-medium text-ivory"
              >
                <WhatsAppIcon size={16} /> Enquire on WhatsApp
              </a>
              <p className="text-center text-[12px] text-mute">
                <a href={`mailto:${siteConfig.contact.email}`} className="link-draw">
                  {siteConfig.contact.email}
                </a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
