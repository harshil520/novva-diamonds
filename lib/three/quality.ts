/**
 * Device capability tiers for real-time 3D. Decided once per session from the
 * GPU, memory and CPU, then refined at runtime by the shared renderer's frame
 * timing (see shared.ts). "none" means: show photographs / static art instead.
 */
export type Tier = "high" | "medium" | "low" | "none";

export interface QualitySettings {
  /** Max rendered pixels per canvas (width × height in device pixels) */
  pixelBudget: number;
  maxDpr: number;
  /** Internal reflections traced per diamond pixel */
  bounces: number;
  fps: 60 | 30;
  /** Whether stones keep turning on their own */
  autoRotate: boolean;
}

/** Ordered from richest to lightest; the runtime governor walks down this list. */
export const QUALITY_LADDER: QualitySettings[] = [
  { pixelBudget: 1_500_000, maxDpr: 1.75, bounces: 5, fps: 60, autoRotate: true },
  { pixelBudget: 900_000, maxDpr: 1.5, bounces: 4, fps: 60, autoRotate: true },
  { pixelBudget: 520_000, maxDpr: 1.25, bounces: 3, fps: 60, autoRotate: true },
  { pixelBudget: 360_000, maxDpr: 1, bounces: 3, fps: 30, autoRotate: true },
  { pixelBudget: 300_000, maxDpr: 1, bounces: 2, fps: 30, autoRotate: false },
];

const START_LEVEL: Record<Exclude<Tier, "none">, number> = { high: 0, medium: 1, low: 3 };

let cachedTier: Tier | null = null;

export function getTier(): Tier {
  if (cachedTier) return cachedTier;
  if (typeof window === "undefined") return "none";
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("force3d")) return (cachedTier = "medium");
    if (params.has("no3d")) return (cachedTier = "none");

    const canvas = document.createElement("canvas");
    // Refuses software fallbacks (SwiftShader, llvmpipe…) that would make the page crawl
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return (cachedTier = "none");
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (/swiftshader|llvmpipe|software|basic render/i.test(gpu)) return (cachedTier = "none");

    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 8;
    const cores = nav.hardwareConcurrency ?? 8;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    if (memory <= 2 || cores <= 2) cachedTier = "low";
    else if (coarse || memory <= 4 || cores <= 4) cachedTier = "medium";
    else if (/intel/i.test(gpu) && !/iris xe|arc/i.test(gpu)) cachedTier = "medium";
    else cachedTier = "high";
    return cachedTier;
  } catch {
    return (cachedTier = "none");
  }
}

export function startLevel(tier: Tier): number {
  if (tier === "none") return QUALITY_LADDER.length - 1;
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  // Phones and tablets start lighter; the runtime governor can still step further down
  return coarse ? Math.max(START_LEVEL[tier], 2) : START_LEVEL[tier];
}
