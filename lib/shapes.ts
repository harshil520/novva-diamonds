import type { DiamondShape } from "@/types/diamond";

export interface ShapeProfile {
  shape: DiamondShape;
  /** File stem in /public/models/diamonds */
  model: string;
  /** One-line optical character, used in the shape explorer */
  character: string;
  /** Typical length-to-width ratio band */
  ratio: string;
  facets: string;
}

export const SHAPE_PROFILES: Record<DiamondShape, ShapeProfile> = {
  Round: {
    shape: "Round",
    model: "round",
    character: "The benchmark of brilliance. Fifty-seven facets tuned to return the most light.",
    ratio: "1.00 – 1.01",
    facets: "57 facets",
  },
  Oval: {
    shape: "Oval",
    model: "oval",
    character: "Brilliant fire in an elongated outline that lengthens the hand.",
    ratio: "1.35 – 1.50",
    facets: "56–58 facets",
  },
  Pear: {
    shape: "Pear",
    model: "pear",
    character: "A rounded shoulder resolving into a single point. Graceful and rare.",
    ratio: "1.45 – 1.75",
    facets: "58 facets",
  },
  Marquise: {
    shape: "Marquise",
    model: "marquise",
    character: "Twin points and the largest face-up area for its weight.",
    ratio: "1.85 – 2.10",
    facets: "56 facets",
  },
  Emerald: {
    shape: "Emerald",
    model: "emerald",
    character: "A step-cut hall of mirrors. Calm, architectural, transparent.",
    ratio: "1.30 – 1.50",
    facets: "57 step facets",
  },
  Princess: {
    shape: "Princess",
    model: "princess",
    character: "Square brilliant with sharp corners and crushed-ice sparkle.",
    ratio: "1.00 – 1.05",
    facets: "76 facets",
  },
  Cushion: {
    shape: "Cushion",
    model: "cushion",
    character: "Softened corners, wide facets, and a romantic, vintage glow.",
    ratio: "1.00 – 1.10",
    facets: "64 facets",
  },
  Radiant: {
    shape: "Radiant",
    model: "radiant",
    character: "The brilliance of a round inside clipped, rectangular lines.",
    ratio: "1.00 – 1.35",
    facets: "70 facets",
  },
  Asscher: {
    shape: "Asscher",
    model: "asscher",
    character: "A square step cut of concentric windows, Art Deco in spirit.",
    ratio: "1.00 – 1.05",
    facets: "58 step facets",
  },
  Heart: {
    shape: "Heart",
    model: "heart",
    character: "The most demanding cut to balance. A symbol, rendered in light.",
    ratio: "0.90 – 1.10",
    facets: "59 facets",
  },
};

export function getShapeProfile(shape: string): ShapeProfile {
  const key = (shape.charAt(0).toUpperCase() + shape.slice(1).toLowerCase()) as DiamondShape;
  return SHAPE_PROFILES[key] ?? SHAPE_PROFILES.Round;
}
