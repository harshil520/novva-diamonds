"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, CornerDownLeft } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DiamondPhoto from "@/components/diamond/DiamondPhoto";
import { ArrowGlyph } from "@/components/ui/Button";
import { QUICK_SEARCHES, searchDiamonds } from "@/lib/search";
import type { Diamond } from "@/types/diamond";
import { cn } from "@/lib/utils";

export default function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchDiamonds(query), [query]);

  // Closing clears the query so the palette always reopens fresh
  if (!open && (query !== "" || active !== 0)) {
    setQuery("");
    setActive(0);
  }

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  const select = (d: Diamond) => go(`/diamonds/${d.id}`);

  const submit = () => {
    if (!query.trim()) return;
    if (results.length && active < results.length) select(results[active]);
    else go(`/diamonds?search=${encodeURIComponent(query.trim())}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((p) => (results.length ? (p + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((p) => (results.length ? (p - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Modal open={open} onClose={onClose} placement="top" label="Search diamonds" showClose={false} className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line px-5 sm:px-6">
        <Search className="h-[18px] w-[18px] shrink-0 text-mute" strokeWidth={1.5} />
        <input
          data-autofocus
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search by ID, certificate, shape or carat"
          aria-label="Search diamonds"
          className="h-16 w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-faint"
        />
        <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[10.5px] text-mute sm:inline">ESC</kbd>
        <button type="button" onClick={onClose} className="text-[12.5px] text-mute sm:hidden">
          Close
        </button>
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-line px-5 py-3 sm:px-6">
        {QUICK_SEARCHES.map((q) => (
          <button
            type="button"
            key={q.label}
            onClick={() => {
              setQuery(q.q);
              setActive(0);
            }}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors",
              query.toLowerCase() === q.q.toLowerCase()
                ? "border-ink bg-ink text-ivory"
                : "border-line text-ink-soft hover:border-ink/40"
            )}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2 sm:p-3">
        <p className="eyebrow px-3 pb-2 pt-2">{query ? `${results.length} results` : "Featured"}</p>
        <AnimatePresence mode="popLayout" initial={false}>
          {results.length ? (
            results.map((d, i) => (
              <motion.button
                layout="position"
                key={d.id}
                type="button"
                data-index={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onMouseEnter={() => setActive(i)}
                onClick={() => select(d)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left transition-colors duration-200",
                  i === active ? "bg-porcelain" : "hover:bg-porcelain/60"
                )}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ivory p-1.5">
                  <DiamondPhoto shape={d.shape} alt="" sizes="48px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-[14.5px] font-medium">
                      {d.carat.toFixed(2)} ct {d.shape}
                    </span>
                    <span className="text-[11px] text-mute">{d.origin}</span>
                  </span>
                  <span className="numeric mt-0.5 block truncate text-[12px] text-mute">
                    {d.color} · {d.clarity} · {d.cut} · {d.certification.laboratory} {d.certification.certificateNumber}
                  </span>
                </span>
              </motion.button>
            ))
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-12 text-center">
              <p className="display text-2xl">No results for “{query}”.</p>
              <p className="mx-auto mt-2 max-w-sm text-[13px] text-mute">
                Try a certificate number, a carat such as 1.5, or a shape.
              </p>
              <button
                type="button"
                onClick={() => go(`/diamonds?search=${encodeURIComponent(query)}`)}
                className="link-draw mt-5 inline-flex items-center gap-2 text-[13px] font-medium"
              >
                Search all diamonds <ArrowGlyph />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[12px] text-mute sm:px-6">
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <CornerDownLeft className="h-3.5 w-3.5" /> to open · ↑↓ to move
        </span>
        <button
          type="button"
          onClick={() => go(query ? `/diamonds?search=${encodeURIComponent(query)}` : "/diamonds")}
          className="group ml-auto inline-flex items-center gap-2 font-medium text-ink"
        >
          View all diamonds <ArrowGlyph />
        </button>
      </div>
    </Modal>
  );
}
