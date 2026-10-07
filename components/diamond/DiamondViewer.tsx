"use client";

import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Box, Image as ImageIcon, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import DiamondCanvas, { type DiamondCanvasHandle } from "@/components/three/DiamondCanvas";
import DiamondPhoto from "./DiamondPhoto";
import type { Diamond } from "@/types/diamond";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Inspection stage for a single stone: live 3D (default) or studio photograph. */
export default function DiamondViewer({ diamond }: { diamond: Diamond }) {
  const canvas = useRef<DiamondCanvasHandle>(null);
  const [mode, setMode] = useState<"3d" | "photo">("3d");
  const [loupe, setLoupe] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  const toggleLoupe = () => {
    const next = !loupe;
    setLoupe(next);
    canvas.current?.setZoom(next ? 2.5 : 1);
  };

  const toggleSpin = () => {
    const next = !spinning;
    setSpinning(next);
    canvas.current?.setAutoRotate(next ? 0.32 : 0);
  };

  const reset = () => {
    setLoupe(false);
    canvas.current?.resetView();
  };

  const effectiveMode = status === "fallback" ? "photo" : mode;

  return (
    <div className="relative">
      <div className="relative aspect-square overflow-hidden rounded-[28px] bg-porcelain sm:aspect-[5/4.4] lg:aspect-square">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_45%,rgb(255_255_255/0.97),transparent_75%)]" />
        <div aria-hidden="true" className="absolute bottom-[25%] left-1/2 h-6 w-[30%] -translate-x-1/2 rounded-[50%] bg-ink/[0.09] blur-xl" />

        {/* 3D stage stays mounted so switching back is instant */}
        <div className={cn("absolute inset-0 transition-opacity duration-700", effectiveMode === "3d" ? "opacity-100" : "pointer-events-none opacity-0")}>
          <DiamondCanvas
            ref={canvas}
            shape={diamond.shape}
            priority
            interactive
            autoRotate={0.32}
            tilt={0.6}
            fill={0.6}
            onStatusChange={setStatus}
            ariaLabel={`${diamond.carat.toFixed(2)} carat ${diamond.shape} diamond in 3D. Drag to rotate.`}
          />
        </div>

        <AnimatePresence>
          {effectiveMode === "photo" && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: loupe ? 1.9 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE_LUXE }}
              className="absolute inset-[18%] cursor-zoom-in"
              onClick={() => setLoupe((l) => !l)}
            >
              <DiamondPhoto shape={diamond.shape} alt={`${diamond.carat.toFixed(2)} carat ${diamond.shape} ${diamond.origin} diamond`} sizes="(max-width: 1024px) 70vw, 40vw" priority />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top ribbon */}
        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between sm:inset-x-6 sm:top-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-[11px] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {diamond.availability === "Available" || !diamond.availability ? "In the Surat vault" : diamond.availability}
          </span>
          {effectiveMode === "3d" && status === "ready" && (
            <span className="hidden text-[11px] text-mute sm:block">Drag to rotate</span>
          )}
          {status === "loading" && effectiveMode === "3d" && (
            <span className="text-[11px] text-mute">Rendering stone…</span>
          )}
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center sm:bottom-6">
          <div className="flex items-center gap-1 rounded-full border border-line bg-paper p-1 shadow-sm" role="toolbar" aria-label="Viewer controls">
            {status !== "fallback" && (
              <div className="flex rounded-full bg-porcelain p-0.5">
                <ToolButton active={effectiveMode === "3d"} onClick={() => setMode("3d")} label="Live 3D view">
                  <Box className="h-4 w-4" strokeWidth={1.4} /> <span className="hidden sm:inline">3D</span>
                </ToolButton>
                <ToolButton active={effectiveMode === "photo"} onClick={() => setMode("photo")} label="Studio photograph">
                  <ImageIcon className="h-4 w-4" strokeWidth={1.4} /> <span className="hidden sm:inline">Photo</span>
                </ToolButton>
              </div>
            )}
            <ToolButton active={loupe} onClick={effectiveMode === "3d" ? toggleLoupe : () => setLoupe((l) => !l)} label={loupe ? "Return to 1× view" : "2.5× loupe"}>
              {loupe ? <ZoomOut className="h-4 w-4" strokeWidth={1.4} /> : <ZoomIn className="h-4 w-4" strokeWidth={1.4} />}
              <span className="numeric hidden sm:inline">{loupe ? "2.5×" : "1×"}</span>
            </ToolButton>
            {effectiveMode === "3d" && (
              <>
                <ToolButton onClick={toggleSpin} label={spinning ? "Pause rotation" : "Resume rotation"}>
                  {spinning ? <Pause className="h-4 w-4" strokeWidth={1.4} /> : <Play className="h-4 w-4" strokeWidth={1.4} />}
                </ToolButton>
                <ToolButton onClick={reset} label="Reset view">
                  <RotateCcw className="h-4 w-4" strokeWidth={1.4} />
                </ToolButton>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-1 text-[11.5px] text-mute">
        <span className="numeric truncate">
          Inscribed · {diamond.certification.laboratory} {diamond.certification.certificateNumber}
        </span>
        <span className="numeric shrink-0">
          {diamond.dimensions.length} × {diamond.dimensions.width} × {diamond.dimensions.depth} mm
        </span>
      </div>
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors duration-300",
        active ? "bg-ink text-ivory" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
