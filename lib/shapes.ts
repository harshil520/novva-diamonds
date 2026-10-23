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
    character: "The most popular shape, with the most sparkle.",
    ratio: "1.00 – 1.01",
    facets: "57 facets",
  },
  Oval: {
    shape: "Oval",
    model: "oval",
    character: "Long, rounded shape that makes fingers look longer.",
    ratio: "1.35 – 1.50",
    facets: "56–58 facets",
  },
  Pear: {
    shape: "Pear",
    model: "pear",
    character: "A teardrop shape: round at one end, pointed at the other.",
    ratio: "1.45 – 1.75",
    facets: "58 facets",
  },
  Marquise: {
    shape: "Marquise",
    model: "marquise",
    character: "Long with two points. Looks large for its weight.",
    ratio: "1.85 – 2.10",
    facets: "56 facets",
  },
  Emerald: {
    shape: "Emerald",
    model: "emerald",
    character: "Rectangle with long, flat facets and a clean look.",
    ratio: "1.30 – 1.50",
    facets: "57 step facets",
  },
  Princess: {
    shape: "Princess",
    model: "princess",
    character: "Square shape with sharp corners and lots of sparkle.",
    ratio: "1.00 – 1.05",
    facets: "76 facets",
  },
  Cushion: {
    shape: "Cushion",
    model: "cushion",
    character: "Square or rectangle with soft, rounded corners.",
    ratio: "1.00 – 1.10",
    facets: "64 facets",
  },
  Radiant: {
    shape: "Radiant",
    model: "radiant",
    character: "Rectangle with cut corners and round-style sparkle.",
    ratio: "1.00 – 1.35",
    facets: "70 facets",
  },
  Asscher: {
    shape: "Asscher",
    model: "asscher",
    character: "Square with flat step facets and cut corners.",
    ratio: "1.00 – 1.05",
    facets: "58 step facets",
  },
  Heart: {
    shape: "Heart",
    model: "heart",
    character: "A heart shape. Best in larger sizes.",
    ratio: "0.90 – 1.10",
    facets: "59 facets",
  },
};

export function getShapeProfile(shape: string): ShapeProfile {
  const key = (shape.charAt(0).toUpperCase() + shape.slice(1).toLowerCase()) as DiamondShape;
  return SHAPE_PROFILES[key] ?? SHAPE_PROFILES.Round;
}
