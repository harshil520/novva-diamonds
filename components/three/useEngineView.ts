"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { getTier } from "@/lib/three/quality";
import type { ViewHandle, ViewListener } from "@/lib/three/bridge";
import type { ViewKind } from "@/lib/three/engine/types";

const noopSubscribe = () => () => undefined;

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

function whenIdle(cb: () => void, timeout = 1500) {
  const w = window as IdleWindow;
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 120);
  return () => window.clearTimeout(id);
}

/** After the page has fully loaded, then at idle — the hero never competes with first paint */
function afterLoad(cb: () => void) {
  let cancelIdle = () => undefined as void;
  const go = () => {
    cancelIdle = whenIdle(cb, 2000);
  };
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
  return () => {
    window.removeEventListener("load", go);
    cancelIdle();
  };
}

export type EngineStatus = "loading" | "ready" | "fallback";

/**
 * Mounts a 3D view into `containerRef`:
 * - never on devices without capable WebGL (status "fallback")
 * - code and assets fetched only as the view nears the viewport
 * - rendering active only while on screen
 * - canvas, resize, pointer and lifecycle handled here; drawing happens in the
 *   render worker (or the main-thread fallback)
 */
export function useEngineView(
  containerRef: RefObject<HTMLDivElement | null>,
  kind: ViewKind,
  options: Record<string, unknown>,
  { priority = false, interactive = false, onEvent }: { priority?: boolean; interactive?: boolean; onEvent?: ViewListener } = {}
) {
  const [status, setStatus] = useState<EngineStatus>("loading");
  const handle = useRef<ViewHandle | null>(null);
  const optionsRef = useRef(options);
  const eventRef = useRef(onEvent);
  useEffect(() => {
    optionsRef.current = options;
    eventRef.current = onEvent;
  });

  const capable = useSyncExternalStore(
    noopSubscribe,
    () => getTier() !== "none",
    () => true
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!capable || !container) return;

    let cancelled = false;
    let view: ViewHandle | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let resize: ResizeObserver | null = null;
    let visibility: IntersectionObserver | null = null;
    let cancelBoot: () => void = () => undefined;
    let unbindPointer: () => void = () => undefined;

    const boot = async () => {
      try {
        const { createView } = await import("@/lib/three/bridge");
        if (cancelled) return;
        canvas = document.createElement("canvas");
        canvas.setAttribute("aria-hidden", "true");
        Object.assign(canvas.style, {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          opacity: "0",
          transition: "opacity 1s cubic-bezier(0.16, 1, 0.3, 1)",
          touchAction: interactive ? "pan-y" : "auto",
          cursor: interactive ? "grab" : "default",
        });
        container.appendChild(canvas);
        const rect = container.getBoundingClientRect();

        const listener: ViewListener = (event, data) => {
          if (cancelled) return;
          if (event === "ready") {
            if (canvas) canvas.style.opacity = "1";
            setStatus("ready");
          } else if (event === "error") {
            setStatus("fallback");
          }
          eventRef.current?.(event, data);
        };

        view = await createView(kind, canvas, { width: rect.width, height: rect.height }, optionsRef.current, listener);
        if (cancelled) {
          view.dispose();
          return;
        }
        handle.current = view;

        resize = new ResizeObserver(([entry]) => view?.resize(entry.contentRect.width, entry.contentRect.height));
        resize.observe(container);
        visibility = new IntersectionObserver(([entry]) => view?.setActive(entry.isIntersecting), { rootMargin: "80px" });
        visibility.observe(container);

        if (interactive) {
          const c = canvas;
          const onDown = (e: PointerEvent) => {
            c.style.cursor = "grabbing";
            view?.pointer("down", e.clientX, e.clientY);
            window.addEventListener("pointermove", onMove, { passive: true });
            window.addEventListener("pointerup", onUp);
            window.addEventListener("pointercancel", onUp);
          };
          const onMove = (e: PointerEvent) => view?.pointer("move", e.clientX, e.clientY);
          const onUp = (e: PointerEvent) => {
            c.style.cursor = "grab";
            view?.pointer("up", e.clientX, e.clientY);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
          };
          c.addEventListener("pointerdown", onDown);
          unbindPointer = () => {
            c.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
          };
        }
      } catch {
        if (!cancelled) setStatus("fallback");
      }
    };

    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        nearby.disconnect();
        cancelBoot = priority ? afterLoad(boot) : whenIdle(boot);
      },
      { rootMargin: "600px" }
    );
    nearby.observe(container);

    return () => {
      cancelled = true;
      cancelBoot();
      nearby.disconnect();
      resize?.disconnect();
      visibility?.disconnect();
      unbindPointer();
      view?.dispose();
      canvas?.remove();
      handle.current = null;
    };
  }, [capable, kind, priority, interactive, containerRef]);

  return { status: capable ? status : ("fallback" as EngineStatus), handle };
}
