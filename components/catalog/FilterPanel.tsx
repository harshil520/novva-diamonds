"use client";

import React, { useId } from "react";
import { Search, X } from "lucide-react";
import { allDiamondClarities, allDiamondColors, allDiamondCuts } from "@/data/diamonds";
import { cn } from "@/lib/utils";
import { CARAT_MAX, CARAT_MIN, type CatalogFilters } from "./useCatalogFilters";

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between">
        <span id={id} className="text-[13px] font-medium">
          {title}
        </span>
        {hint && <span className="numeric text-[11.5px] text-mute">{hint}</span>}
      </div>
      <div className="mt-3.5">{children}</div>
    </div>
  );
}

function Scale<T extends string>({
  values,
  selected,
  onToggle,
  labels,
  columns,
}: {
  values: readonly T[];
  selected: T[];
  onToggle: (v: T) => void;
  labels?: [string, string];
  columns?: number;
}) {
  const cols = columns ?? values.length;
  return (
    <div>
      <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {values.map((v) => {
          const on = selected.includes(v);
          return (
            <button
              key={v}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(v)}
              className={cn(
                "h-10 text-[12px] font-medium transition-colors duration-300",
                on ? "bg-ink text-ivory" : "bg-paper text-ink-soft hover:bg-porcelain"
              )}
            >
              {v}
            </button>
          );
        })}
      </div>
      {labels && (
        <div className="mt-2 flex justify-between text-[10.5px] uppercase tracking-[0.12em] text-faint">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}
    </div>
  );
}

export function CaratRange({ min, max, onChange }: { min: number; max: number; onChange: (min: number, max: number) => void }) {
  const id = useId();
  const pct = (v: number) => ((v - CARAT_MIN) / (CARAT_MAX - CARAT_MIN)) * 100;
  return (
    <div>
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line-strong" />
        <div className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-ink" style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }} />
        <input
          id={`${id}-min`}
          aria-label="Minimum carat"
          type="range"
          min={CARAT_MIN}
          max={CARAT_MAX}
          step={0.05}
          value={min}
          onChange={(e) => onChange(Math.min(parseFloat(e.target.value), max - 0.05), max)}
          className="range-thumb absolute inset-0 h-6 w-full"
        />
        <input
          id={`${id}-max`}
          aria-label="Maximum carat"
          type="range"
          min={CARAT_MIN}
          max={CARAT_MAX}
          step={0.05}
          value={max}
          onChange={(e) => onChange(min, Math.max(parseFloat(e.target.value), min + 0.05))}
          className="range-thumb absolute inset-0 h-6 w-full"
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="numeric rounded-lg border border-line bg-paper px-3 py-1.5 text-[12.5px]">{min.toFixed(2)} ct</span>
        <span className="h-px w-4 bg-line-strong" />
        <span className="numeric rounded-lg border border-line bg-paper px-3 py-1.5 text-[12.5px]">{max.toFixed(2)} ct</span>
      </div>
    </div>
  );
}

export default function FilterPanel({ catalog, showSearch = true }: { catalog: CatalogFilters; showSearch?: boolean }) {
  const { filters, update, toggle } = catalog;
  const searchId = useId();

  return (
    <div>
      {showSearch && (
        <Group title="Search">
          <div className="relative">
            <label htmlFor={searchId} className="sr-only">
              Search by stone ID, certificate, shape or grade
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" strokeWidth={1.5} />
            <input
              id={searchId}
              type="search"
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              placeholder="ID, certificate, carat…"
              className="h-11 w-full rounded-xl border border-line bg-paper pl-10 pr-9 text-[13.5px] outline-none transition-colors placeholder:text-faint focus:border-ink"
            />
            {filters.search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => update("search", "")}
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-mute hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </Group>
      )}

      <Group title="Origin">
        <div className="grid grid-cols-3 rounded-full border border-line bg-paper p-1">
          {(["All", "Natural", "Lab-Grown"] as const).map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={filters.origin === o}
              onClick={() => update("origin", o)}
              className={cn(
                "h-9 rounded-full text-[12.5px] transition-colors duration-300",
                filters.origin === o ? "bg-ink text-ivory" : "text-ink-soft hover:text-ink"
              )}
            >
              {o === "Lab-Grown" ? "Lab-grown" : o}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Carat weight" hint={`${filters.caratMin.toFixed(2)} – ${filters.caratMax.toFixed(2)}`}>
        <CaratRange
          min={filters.caratMin}
          max={filters.caratMax}
          onChange={(mn, mx) => {
            update("caratMin", Math.round(mn * 100) / 100);
            update("caratMax", Math.round(mx * 100) / 100);
          }}
        />
      </Group>

      <Group title="Colour" hint="D – J">
        <Scale values={allDiamondColors} selected={filters.colors} onToggle={(v) => toggle("colors", v)} labels={["Colourless", "Near colourless"]} />
      </Group>

      <Group title="Clarity" hint="FL – SI2">
        <Scale values={allDiamondClarities} columns={4} selected={filters.clarities} onToggle={(v) => toggle("clarities", v)} labels={["Flawless", "Slightly included"]} />
      </Group>

      <Group title="Cut grade">
        <div className="flex flex-wrap gap-2">
          {allDiamondCuts.map((c) => (
            <Chip key={c} on={filters.cuts.includes(c)} onClick={() => toggle("cuts", c)}>
              {c}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Grading laboratory">
        <div className="flex flex-wrap gap-2">
          {(["GIA", "IGI"] as const).map((l) => (
            <Chip key={l} on={filters.labs.includes(l)} onClick={() => toggle("labs", l)}>
              {l}
            </Chip>
          ))}
        </div>
      </Group>
    </div>
  );
}

export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "h-9 rounded-full border px-4 text-[12.5px] transition-colors duration-300",
        on ? "border-ink bg-ink text-ivory" : "border-line bg-paper text-ink-soft hover:border-ink/40"
      )}
    >
      {children}
    </button>
  );
}
