"use client";

import React, { useCallback, useRef } from "react";
import { GLOBE_LABELS } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useEngineView } from "./useEngineView";

/**
 * Interactive dotted globe with live routes from Surat. Rendered in the 3D
 * worker, loaded only as it nears the viewport and paused off-screen. Devices
 * without capable WebGL get `fallback`.
 */
export default function RouteGlobe({ fallback, className }: { fallback: React.ReactNode; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Labels arrive as flat [x, y, facing] triples; written straight to the DOM, no re-render
  const onEvent = useCallback((event: string, data?: unknown) => {
    if (event !== "labels" || !Array.isArray(data)) return;
    for (let i = 0; i < GLOBE_LABELS.length; i++) {
      const el = labelRefs.current[i];
      if (!el) continue;
      el.style.transform = `translate3d(${data[i * 3]}px, ${data[i * 3 + 1]}px, 0)`;
      el.style.opacity = String(data[i * 3 + 2]);
    }
  }, []);

  const { status } = useEngineView(wrapRef, "globe", {}, { interactive: true, onEvent });

  if (status === "fallback") return <>{fallback}</>;

  return (
    <div
      ref={wrapRef}
      className={cn("relative aspect-square w-full select-none", className)}
      role="img"
      aria-label="Interactive globe of delivery routes from the Surat Diamond Bourse. Drag to turn."
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_40%,#f6f3ee,#e6e1d8)] transition-opacity duration-1000",
          status === "ready" ? "opacity-0" : "opacity-100"
        )}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {GLOBE_LABELS.map((h, i) => (
          <span
            key={h.name}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className={cn(
              "absolute left-0 top-0 whitespace-nowrap pl-2.5 text-[11px] leading-none opacity-0",
              i === 0 ? "font-semibold text-ink" : "text-ink-soft"
            )}
          >
            <span className={cn("block", i === 0 ? "-translate-y-[180%]" : "-translate-y-1/2")}>
              {h.name === "Surat Diamond Bourse" ? "Surat" : h.name}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
