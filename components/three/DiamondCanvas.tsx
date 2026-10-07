"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Image from "next/image";
import { getDiamondImage } from "@/lib/diamondImages";
import { getShapeProfile } from "@/lib/shapes";
import { cn } from "@/lib/utils";
import { useEngineView, type EngineStatus } from "./useEngineView";

export interface DiamondCanvasHandle {
  setExtraSpin: (radians: number) => void;
  setPointer: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  setAutoRotate: (speed: number) => void;
  resetView: () => void;
}

interface DiamondCanvasProps {
  shape: string;
  className?: string;
  autoRotate?: number;
  tilt?: number;
  interactive?: boolean;
  fill?: number;
  /** Boot right after page load (above-the-fold) rather than when scrolled near */
  priority?: boolean;
  /** Show the studio photograph while the 3D engine boots */
  showFallback?: boolean;
  /** Track pointer across the whole window for a parallax tilt */
  followPointer?: boolean;
  onStatusChange?: (status: EngineStatus) => void;
  ariaLabel?: string;
}

/**
 * Real-time ray-traced diamond. Rendering runs in a Web Worker (OffscreenCanvas)
 * when the browser supports it, so it never blocks scrolling or input; it is
 * paused off-screen and skipped entirely on devices without capable WebGL.
 */
const DiamondCanvas = forwardRef<DiamondCanvasHandle, DiamondCanvasProps>(function DiamondCanvas(
  {
    shape,
    className,
    autoRotate = 0.35,
    tilt = 0.55,
    interactive = false,
    fill = 0.78,
    priority = false,
    showFallback = true,
    followPointer = false,
    onStatusChange,
    ariaLabel,
  },
  ref
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const profile = getShapeProfile(shape);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const { status, handle } = useEngineView(
    wrapRef,
    "diamond",
    { model: profile.model, autoRotate: reduceMotion ? 0 : autoRotate, tilt, interactive, fill },
    { priority, interactive }
  );

  useImperativeHandle(ref, () => ({
    setExtraSpin: (r) => handle.current?.call("setExtraSpin", r),
    setPointer: (x, y) => handle.current?.call("setPointer", x, y),
    setZoom: (z) => handle.current?.call("setZoom", z),
    setAutoRotate: (s) => handle.current?.call("setAutoRotate", s),
    resetView: () => handle.current?.call("resetView"),
  }));

  const statusCb = useRef(onStatusChange);
  useEffect(() => {
    statusCb.current = onStatusChange;
  });
  useEffect(() => {
    statusCb.current?.(status);
  }, [status]);

  useEffect(() => {
    handle.current?.call("setModel", profile.model);
  }, [profile.model, handle]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    handle.current?.call("setAutoRotate", autoRotate);
  }, [autoRotate, handle]);

  // Window-wide pointer parallax, coalesced to one message per frame
  useEffect(() => {
    if (!followPointer) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = (e.clientX / window.innerWidth) * 2 - 1;
      y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          handle.current?.call("setPointer", x, y);
        });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [followPointer, handle]);

  const showPhoto = showFallback && status !== "ready";

  return (
    <div ref={wrapRef} className={cn("relative h-full w-full", className)} role="img" aria-label={ariaLabel ?? `${profile.shape} cut diamond`}>
      {showPhoto && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700",
            status === "fallback" ? "opacity-100" : "opacity-60"
          )}
        >
          <div className="relative aspect-square h-[62%] max-h-full">
            <Image
              src={getDiamondImage(profile.shape)}
              alt=""
              fill
              sizes="(max-width: 768px) 70vw, 40vw"
              className="diamond-photo object-contain"
              priority={priority}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default DiamondCanvas;
