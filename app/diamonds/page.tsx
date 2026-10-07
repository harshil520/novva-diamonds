"use client";

import React, { Suspense, useCallback, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import DiamondCard from "@/components/diamond/DiamondCard";
import DiamondRow from "@/components/diamond/DiamondRow";
import DiamondPhoto from "@/components/diamond/DiamondPhoto";
import FilterPanel from "@/components/catalog/FilterPanel";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { Button, ButtonLink, ArrowGlyph } from "@/components/ui/Button";
import { TextReveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";
import { useUI } from "@/components/providers/UIProvider";
import { useCatalogFilters, SORT_OPTIONS, CARAT_MIN, CARAT_MAX, type CatalogFilters } from "@/components/catalog/useCatalogFilters";
import { allDiamondShapes, diamondsData } from "@/data/diamonds";
import { getConciergeWhatsAppUrl } from "@/lib/whatsapp";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";

type ViewMode = "grid" | "list";
const VIEW_KEY = "novva_view";
const viewListeners = new Set<() => void>();

/** Gallery / list preference, remembered per browser. */
function useViewMode(): [ViewMode, (v: ViewMode) => void] {
  const view = useSyncExternalStore(
    (cb) => {
      viewListeners.add(cb);
      return () => viewListeners.delete(cb);
    },
    () => {
      try {
        return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
      } catch {
        return "grid";
      }
    },
    () => "grid" as ViewMode
  );
  const setView = useCallback((v: ViewMode) => {
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* storage unavailable */
    }
    viewListeners.forEach((l) => l());
  }, []);
  return [view, setView];
}

function ShapeStrip({ catalog }: { catalog: CatalogFilters }) {
  const { filters, toggle, update } = catalog;
  return (
    <div className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0" role="group" aria-label="Filter by shape">
      <button
        type="button"
        onClick={() => update("shapes", [])}
        aria-pressed={!filters.shapes.length}
        className="group flex w-[78px] shrink-0 flex-col items-center gap-2 rounded-2xl py-3 sm:w-[88px]"
      >
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full border text-[11px] font-medium transition-colors duration-300",
            !filters.shapes.length ? "border-ink bg-ink text-ivory" : "border-line text-mute group-hover:border-ink/40"
          )}
        >
          All
        </span>
        <span className={cn("text-[12px]", !filters.shapes.length ? "text-ink" : "text-mute")}>All shapes</span>
      </button>
      {allDiamondShapes.map((s) => {
        const on = filters.shapes.includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle("shapes", s)}
            aria-pressed={on}
            className="group flex w-[78px] shrink-0 flex-col items-center gap-2 rounded-2xl py-3 sm:w-[88px]"
          >
            <span
              className={cn(
                "relative flex h-14 w-14 items-center justify-center rounded-full p-2.5 transition-all duration-500 ease-[var(--ease-luxe)]",
                on ? "bg-paper shadow-[0_0_0_1px_var(--color-ink)]" : "bg-porcelain group-hover:bg-mist"
              )}
            >
              <span className={cn("h-full w-full transition-transform duration-500 ease-[var(--ease-luxe)]", on ? "scale-110" : "group-hover:scale-110")}>
                <DiamondPhoto shape={s} alt="" sizes="56px" />
              </span>
            </span>
            <span className={cn("text-[12px] transition-colors", on ? "font-medium text-ink" : "text-mute group-hover:text-ink")}>{s}</span>
          </button>
        );
      })}
    </div>
  );
}

function ActiveChips({ catalog }: { catalog: CatalogFilters }) {
  const { filters, update, toggle, reset, activeCount } = catalog;
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.search.trim()) chips.push({ key: "q", label: `“${filters.search.trim()}”`, clear: () => update("search", "") });
  if (filters.origin !== "All") chips.push({ key: "o", label: filters.origin === "Lab-Grown" ? "Lab-grown" : "Natural", clear: () => update("origin", "All") });
  filters.shapes.forEach((s) => chips.push({ key: `s${s}`, label: s, clear: () => toggle("shapes", s) }));
  if (filters.caratMin > CARAT_MIN || filters.caratMax < CARAT_MAX)
    chips.push({
      key: "c",
      label: `${filters.caratMin.toFixed(2)}–${filters.caratMax.toFixed(2)} ct`,
      clear: () => {
        update("caratMin", CARAT_MIN);
        update("caratMax", CARAT_MAX);
      },
    });
  filters.colors.forEach((c) => chips.push({ key: `col${c}`, label: `Colour ${c}`, clear: () => toggle("colors", c) }));
  filters.clarities.forEach((c) => chips.push({ key: `cl${c}`, label: `Clarity ${c}`, clear: () => toggle("clarities", c) }));
  filters.cuts.forEach((c) => chips.push({ key: `cut${c}`, label: `${c} cut`, clear: () => toggle("cuts", c) }));
  filters.labs.forEach((l) => chips.push({ key: `l${l}`, label: l, clear: () => toggle("labs", l) }));

  if (!activeCount) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence initial={false}>
        {chips.map((c) => (
          <motion.button
            layout
            key={c.key}
            type="button"
            onClick={c.clear}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: EASE_LUXE }}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-porcelain pl-3.5 pr-2 text-[12px] text-ink-soft transition-colors hover:bg-mist"
            aria-label={`Remove filter ${c.label}`}
          >
            {c.label}
            <X className="h-3 w-3" />
          </motion.button>
        ))}
      </AnimatePresence>
      <button type="button" onClick={reset} className="link-draw ml-1 text-[12px] font-medium">
        Clear all
      </button>
    </div>
  );
}

function CatalogContent() {
  const catalog = useCatalogFilters();
  const { filters, update, results, activeCount, reset } = catalog;
  const { openEnquiry } = useUI();
  const [view, changeView] = useViewMode();
  const [sheetOpen, setSheetOpen] = useState(false);
  const mounted = useHydrated();

  const sourcingUrl = getConciergeWhatsAppUrl({
    topic: "sourcing",
    shape: filters.shapes.join(", ") || "Any",
    carat: `${filters.caratMin} - ${filters.caratMax} ct`,
  });

  return (
    <div className="pb-24 pt-[72px]">
      {/* Masthead */}
      <header className="shell pb-8 pt-12 sm:pt-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">The collection · Surat vault</p>
            <TextReveal
              as="h1"
              immediate
              segments={["Certified", { em: "loose diamonds" }]}
              className="display mt-4 text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.98]"
            />
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-mute">
            Every stone is precision-analysed, laser-inscribed and certified by GIA or IGI — ready for insured dispatch
            worldwide.
          </p>
        </div>
        <div className="mt-10 border-y border-line py-2">
          <ShapeStrip catalog={catalog} />
        </div>
      </header>

      <div className="shell grid gap-12 lg:grid-cols-[272px_minmax(0,1fr)] xl:gap-16">
        {/* Desktop filters */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-10 pr-2">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[13px] font-medium">
                Refine {activeCount > 0 && <span className="numeric ml-1 rounded-full bg-ink px-1.5 py-0.5 text-[10.5px] text-ivory">{activeCount}</span>}
              </p>
              {activeCount > 0 && (
                <button type="button" onClick={reset} className="link-draw text-[12px] text-mute hover:text-ink">
                  Reset
                </button>
              )}
            </div>
            <FilterPanel catalog={catalog} />
          </div>
        </aside>

        <section aria-label="Results" className="min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13.5px]" aria-live="polite">
              <span className="numeric font-medium">{results.length}</span>{" "}
              <span className="text-mute">
                {results.length === 1 ? "diamond" : "diamonds"} of {diamondsData.length}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <Select label="Sort" value={filters.sort} options={SORT_OPTIONS} onChange={(v) => update("sort", v)} />
              </div>
              <div className="flex rounded-full border border-line bg-paper p-1" role="group" aria-label="View">
                {(
                  [
                    ["grid", LayoutGrid, "Gallery view"],
                    ["list", List, "Compare list view"],
                  ] as const
                ).map(([v, Icon, label]) => (
                  <button
                    key={v}
                    type="button"
                    aria-label={label}
                    aria-pressed={view === v}
                    onClick={() => changeView(v)}
                    className={cn("flex h-8 w-8 items-center justify-center rounded-full transition-colors", view === v ? "bg-ink text-ivory" : "text-mute hover:text-ink")}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 min-h-[1px]">
            <ActiveChips catalog={catalog} />
          </div>

          {/* Results */}
          <div className="mt-8">
            {results.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_LUXE }}
                className="rounded-[28px] border border-line bg-paper px-6 py-16 text-center sm:px-12"
              >
                <p className="eyebrow">No exact match</p>
                <h2 className="display mx-auto mt-4 max-w-lg text-[2.2rem] leading-tight sm:text-[2.8rem]">
                  Not in the vault today. <em>We can find it.</em>
                </h2>
                <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-mute">
                  Working directly on the Surat Diamond Bourse, we see thousands of stones being polished every week. Tell
                  us your specification and we will source it.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <ButtonLink href={sourcingUrl}>
                    <WhatsAppIcon size={15} /> Request custom sourcing
                  </ButtonLink>
                  <Button variant="outline" onClick={() => openEnquiry({ topic: "Custom Sourcing" })}>
                    Send an enquiry
                  </Button>
                  <button type="button" onClick={reset} className="link-draw ml-2 text-[13px] font-medium">
                    Reset filters
                  </button>
                </div>
              </motion.div>
            ) : view === "grid" ? (
              <motion.ul layout className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 xl:grid-cols-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.map((d, i) => (
                    <motion.li
                      layout
                      key={d.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.03, ease: EASE_LUXE }}
                    >
                      <DiamondCard diamond={d} priority={i < 3} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            ) : (
              <div>
                <div className="hidden grid-cols-[64px_1.6fr_repeat(5,minmax(0,0.7fr))_1fr_auto] gap-5 border-b border-ink px-3 pb-3 text-[10.5px] uppercase tracking-[0.14em] text-mute md:grid">
                  <span />
                  <span>Stone</span>
                  <span>Colour</span>
                  <span>Clarity</span>
                  <span>Cut</span>
                  <span>Lab</span>
                  <span>Origin</span>
                  <span>Indicative</span>
                  <span className="w-[76px]" />
                </div>
                <AnimatePresence initial={false}>
                  {results.map((d) => (
                    <motion.div key={d.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                      <DiamondRow diamond={d} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-20 flex flex-col items-start justify-between gap-6 rounded-[28px] bg-porcelain/70 p-8 sm:flex-row sm:items-center sm:p-10">
              <div>
                <p className="display text-[1.8rem] leading-tight">Not quite the one?</p>
                <p className="mt-2 max-w-md text-[14px] text-mute">We source to specification from the bourse floor — ratios, matched pairs, investment carats.</p>
              </div>
              <ButtonLink href={sourcingUrl}>
                <WhatsAppIcon size={15} /> Source a stone <ArrowGlyph />
              </ButtonLink>
            </div>
          )}
        </section>
      </div>

      {/* Mobile: floating filter trigger + full filter sheet */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {!sheetOpen && (
              <motion.button
                type="button"
                onClick={() => setSheetOpen(true)}
                initial={{ y: 80, x: "-50%" }}
                animate={{ y: 0, x: "-50%" }}
                exit={{ y: 80, x: "-50%" }}
                transition={{ duration: 0.6, ease: EASE_LUXE }}
                className="fixed bottom-6 left-1/2 z-40 flex h-12 items-center gap-2.5 rounded-full bg-ink px-6 text-[13.5px] font-medium text-ivory shadow-[0_18px_40px_-14px_rgb(18_18_18/0.6)] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
                Filter & sort
                {activeCount > 0 && <span className="numeric rounded-full bg-ivory px-1.5 text-[11px] text-ink">{activeCount}</span>}
              </motion.button>
            )}
          </AnimatePresence>,
          document.body
        )}

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} placement="bottom" label="Filter and sort" className="flex flex-col lg:hidden">
        <div className="flex items-center justify-between border-b border-line px-6 pb-4 pt-6">
          <p className="display text-[1.6rem]">Refine</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-6 border-b border-line pb-6">
            <p className="mb-3 text-[13px] font-medium">Sort by</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={filters.sort === o.value}
                  onClick={() => update("sort", o.value)}
                  className={cn(
                    "h-9 rounded-full border px-4 text-[12.5px] transition-colors",
                    filters.sort === o.value ? "border-ink bg-ink text-ivory" : "border-line text-ink-soft"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <FilterPanel catalog={catalog} />
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-line bg-paper px-6 py-4">
          <Button variant="outline" onClick={reset} disabled={!activeCount}>
            Clear
          </Button>
          <Button onClick={() => setSheetOpen(false)}>
            Show {results.length} {results.length === 1 ? "diamond" : "diamonds"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="shell pb-24 pt-[120px]" aria-busy="true" aria-label="Loading the collection">
      <div className="skeleton h-4 w-40 rounded-full" />
      <div className="skeleton mt-5 h-16 w-3/4 max-w-xl rounded-2xl" />
      <div className="mt-16 grid grid-cols-2 gap-5 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5] rounded-[24px]" />
            <div className="skeleton mt-4 h-5 w-2/3 rounded-full" />
            <div className="skeleton mt-2 h-3 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DiamondsPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent />
    </Suspense>
  );
}
