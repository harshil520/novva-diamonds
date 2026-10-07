"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Diamond } from "@/types/diamond";
import Modal from "@/components/ui/Modal";
import SearchPalette from "@/components/layout/SearchPalette";
import EnquiryForm, { type EnquiryTopic } from "@/components/diamond/EnquiryForm";

interface EnquiryOptions {
  diamond?: Diamond | null;
  topic?: EnquiryTopic;
}

interface UIContextValue {
  openSearch: () => void;
  openEnquiry: (opts?: EnquiryOptions) => void;
}

const UIContext = createContext<UIContextValue>({ openSearch: () => undefined, openEnquiry: () => undefined });
export const useUI = () => useContext(UIContext);

/** Global overlays: search palette (⌘K / Ctrl+K / "/") and the private enquiry dialog. */
export default function UIProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [enquiry, setEnquiry] = useState<(EnquiryOptions & { key: number }) | null>(null);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const openEnquiry = useCallback((opts?: EnquiryOptions) => setEnquiry({ ...opts, key: Date.now() }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, select, [contenteditable=true]");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <UIContext.Provider value={{ openSearch, openEnquiry }}>
      {children}
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Modal open={!!enquiry} onClose={() => setEnquiry(null)} label="Private enquiry" className="max-w-xl">
        {enquiry && (
          <div className="max-h-[88vh] overflow-y-auto p-6 sm:p-9">
            <p className="eyebrow">Private enquiry</p>
            <h2 className="display mt-3 text-[2rem] sm:text-[2.4rem]">
              {enquiry.diamond
                ? `${enquiry.diamond.carat.toFixed(2)} ct ${enquiry.diamond.shape}`
                : "How may we help?"}
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-mute">
              A diamond specialist — not a call centre — will reply with pricing, video and delivery terms.
            </p>
            <div className="mt-7">
              <EnquiryForm key={enquiry.key} diamond={enquiry.diamond} topic={enquiry.topic} />
            </div>
          </div>
        )}
      </Modal>
    </UIContext.Provider>
  );
}
