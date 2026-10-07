"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type TargetAndTransition } from "motion/react";
import { X } from "lucide-react";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";

type Placement = "center" | "top" | "right" | "bottom";

const panelMotion: Record<Placement, { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }> = {
  center: {
    initial: { opacity: 0, y: 24, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 12, scale: 0.98 },
  },
  top: {
    initial: { opacity: 0, y: -16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
  bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
};

const panelPosition: Record<Placement, string> = {
  center: "items-center justify-center p-4",
  top: "items-start justify-center px-4 pt-[9vh]",
  right: "items-stretch justify-end",
  bottom: "items-end justify-center",
};

/**
 * Accessible overlay: focus is trapped and restored, Escape closes, page scroll
 * is locked while open.
 */
export default function Modal({
  open,
  onClose,
  children,
  placement = "center",
  className,
  label,
  showClose = true,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  placement?: Placement;
  className?: string;
  label: string;
  showClose?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const focusFirst = window.setTimeout(() => {
      const target =
        panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") ??
        panelRef.current?.querySelector<HTMLElement>("input, button, a, select, textarea");
      target?.focus();
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
      if (e.key === "Tab" && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!hydrated) return null;

  const m = panelMotion[placement];
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-[90] flex", panelPosition[placement])} role="presentation">
          <motion.div
            className="absolute inset-0 bg-ink/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
           
            initial={m.initial}
            animate={m.animate}
            exit={m.exit}
            transition={{ duration: placement === "center" || placement === "top" ? 0.5 : 0.6, ease: EASE_LUXE }}
            className={cn(
              "relative z-10 bg-paper shadow-[0_40px_120px_-40px_rgb(18_18_18/0.45)]",
              placement === "center" && "w-full max-w-lg rounded-[28px]",
              placement === "top" && "w-full max-w-2xl rounded-[24px]",
              placement === "right" && "h-full w-full max-w-md",
              placement === "bottom" && "max-h-[88vh] w-full rounded-t-[28px]",
              className
            )}
          >
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-mute transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
