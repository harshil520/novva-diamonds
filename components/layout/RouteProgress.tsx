"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Hairline progress bar for client-side navigations. */
export default function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timer = useRef<number>(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      window.clearTimeout(timer.current);
      setState("loading");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Route committed → complete the bar during render, then fade it out
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [seenRoute, setSeenRoute] = useState(routeKey);
  if (routeKey !== seenRoute) {
    setSeenRoute(routeKey);
    if (state === "loading") setState("done");
  }

  useEffect(() => {
    if (state !== "done") return;
    timer.current = window.setTimeout(() => setState("idle"), 500);
    return () => window.clearTimeout(timer.current);
  }, [state]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[2px]">
      <div
        className="h-full origin-left bg-ink"
        style={{
          transform: `scaleX(${state === "loading" ? 0.7 : state === "done" ? 1 : 0})`,
          opacity: state === "idle" ? 0 : 1,
          transition:
            state === "loading"
              ? "transform 6s cubic-bezier(0.1, 0.7, 0.1, 1), opacity 0.2s"
              : "transform 0.3s ease-out, opacity 0.4s 0.15s",
        }}
      />
    </div>
  );
}
