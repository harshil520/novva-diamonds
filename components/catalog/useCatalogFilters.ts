"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { diamondsData, allDiamondShapes, allDiamondColors, allDiamondClarities, allDiamondCuts } from "@/data/diamonds";
import type { DiamondClarity, DiamondColor, DiamondCut, DiamondOrigin, DiamondShape } from "@/types/diamond";

export type SortKey = "carat-desc" | "carat-asc" | "price-desc" | "price-asc" | "newest";
export type Lab = "GIA" | "IGI";

export const CARAT_MIN = 0.3;
export const CARAT_MAX = 2.5;

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "carat-desc", label: "Carat, high to low" },
  { value: "carat-asc", label: "Carat, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "newest", label: "Latest certification" },
];

export interface FilterState {
  search: string;
  shapes: DiamondShape[];
  origin: DiamondOrigin | "All";
  cuts: DiamondCut[];
  colors: DiamondColor[];
  clarities: DiamondClarity[];
  labs: Lab[];
  caratMin: number;
  caratMax: number;
  sort: SortKey;
}

const DEFAULTS: FilterState = {
  search: "",
  shapes: [],
  origin: "All",
  cuts: [],
  colors: [],
  clarities: [],
  labs: [],
  caratMin: CARAT_MIN,
  caratMax: CARAT_MAX,
  sort: "carat-desc",
};

function list<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => allowed.find((a) => a.toLowerCase() === v.trim().toLowerCase()))
    .filter((v): v is T => !!v);
}

function parse(params: URLSearchParams): FilterState {
  const origin = params.get("origin");
  const carat = params.get("carat")?.split("-").map(parseFloat);
  const sort = params.get("sort") as SortKey | null;
  return {
    search: params.get("search") || params.get("q") || "",
    shapes: list(params.get("shape"), allDiamondShapes),
    origin: origin === "Natural" || origin === "Lab-Grown" ? origin : "All",
    cuts: list(params.get("cut"), allDiamondCuts),
    colors: list(params.get("color"), allDiamondColors),
    clarities: list(params.get("clarity"), allDiamondClarities),
    labs: list(params.get("lab"), ["GIA", "IGI"] as const),
    caratMin: carat && !isNaN(carat[0]) ? Math.max(CARAT_MIN, carat[0]) : CARAT_MIN,
    caratMax: carat && !isNaN(carat[1]) ? Math.min(CARAT_MAX, carat[1]) : CARAT_MAX,
    sort: sort && SORT_OPTIONS.some((o) => o.value === sort) ? sort : "carat-desc",
  };
}

function serialise(f: FilterState): string {
  const p = new URLSearchParams();
  if (f.search.trim()) p.set("search", f.search.trim());
  if (f.shapes.length) p.set("shape", f.shapes.join(","));
  if (f.origin !== "All") p.set("origin", f.origin);
  if (f.colors.length) p.set("color", f.colors.join(","));
  if (f.clarities.length) p.set("clarity", f.clarities.join(","));
  if (f.labs.length) p.set("lab", f.labs.join(","));
  if (f.cuts.length) p.set("cut", f.cuts.join(","));
  if (f.caratMin > CARAT_MIN || f.caratMax < CARAT_MAX) p.set("carat", `${f.caratMin}-${f.caratMax}`);
  if (f.sort !== "carat-desc") p.set("sort", f.sort);
  return p.toString();
}

/** Same matching rules as the original catalogue search (ID, cert, lab, shape, origin, 4Cs, carat, price). */
function matchesSearch(q: string, d: (typeof diamondsData)[number]) {
  const numeric = parseFloat(q);
  return (
    d.id.toLowerCase().includes(q) ||
    d.certification.certificateNumber.toLowerCase().includes(q) ||
    d.certification.laboratory.toLowerCase().includes(q) ||
    d.shape.toLowerCase().includes(q) ||
    d.origin.toLowerCase().includes(q) ||
    d.color.toLowerCase() === q ||
    (q.includes("color") && q.includes(d.color.toLowerCase())) ||
    d.clarity.toLowerCase().includes(q) ||
    d.cut.toLowerCase().includes(q) ||
    (!isNaN(numeric) && Math.abs(d.carat - numeric) < 0.15) ||
    (!isNaN(numeric) && numeric >= 100 && Math.abs(d.indicativePriceUSD - numeric) <= 150)
  );
}

export function useCatalogFilters() {
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const [filters, setFilters] = useState<FilterState>(() => parse(new URLSearchParams(paramsKey)));
  const [seenParams, setSeenParams] = useState(paramsKey);

  // External navigation (search palette, footer links…) → adopt the URL's filters
  if (paramsKey !== seenParams) {
    setSeenParams(paramsKey);
    const next = parse(new URLSearchParams(paramsKey));
    if (serialise(next) !== serialise(filters)) setFilters(next);
  }

  // Filters → shareable URL
  useEffect(() => {
    const qs = serialise(filters);
    if (qs !== new URLSearchParams(window.location.search).toString()) {
      window.history.replaceState(null, "", qs ? `/diamonds?${qs}` : "/diamonds");
    }
  }, [filters]);

  const update = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const toggle = useCallback(<K extends "shapes" | "cuts" | "colors" | "clarities" | "labs">(key: K, value: FilterState[K][number]) => {
    setFilters((f) => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  }, []);

  const reset = useCallback(() => setFilters((f) => ({ ...DEFAULTS, sort: f.sort })), []);

  const results = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return diamondsData
      .filter((d) => {
        if (q && !matchesSearch(q, d)) return false;
        if (filters.shapes.length && !filters.shapes.includes(d.shape)) return false;
        if (filters.origin !== "All" && d.origin !== filters.origin) return false;
        if (filters.cuts.length && !filters.cuts.includes(d.cut)) return false;
        if (filters.colors.length && !filters.colors.includes(d.color)) return false;
        if (filters.clarities.length && !filters.clarities.includes(d.clarity)) return false;
        if (filters.labs.length && !filters.labs.includes(d.certification.laboratory)) return false;
        if (d.carat < filters.caratMin || d.carat > filters.caratMax) return false;
        return true;
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case "carat-desc":
            return b.carat - a.carat;
          case "carat-asc":
            return a.carat - b.carat;
          case "price-desc":
            return b.indicativePriceUSD - a.indicativePriceUSD;
          case "price-asc":
            return a.indicativePriceUSD - b.indicativePriceUSD;
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [filters]);

  const activeCount =
    (filters.search.trim() ? 1 : 0) +
    filters.shapes.length +
    (filters.origin !== "All" ? 1 : 0) +
    filters.cuts.length +
    filters.colors.length +
    filters.clarities.length +
    filters.labs.length +
    (filters.caratMin > CARAT_MIN || filters.caratMax < CARAT_MAX ? 1 : 0);

  return { filters, update, toggle, reset, results, activeCount };
}

export type CatalogFilters = ReturnType<typeof useCatalogFilters>;
