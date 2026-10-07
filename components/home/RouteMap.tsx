"use client";

import React from "react";
import { motion } from "motion/react";
import { EASE_LUXE } from "@/lib/motion";

// Static fallback for devices without capable 3D: equirectangular map, lon −130…160, lat −45…60 → 1000 × 400
const project = (lon: number, lat: number) => [((lon + 130) / 290) * 1000, ((60 - lat) / 105) * 400] as const;
const SURAT = project(72.83, 21.17);
const HUBS: { name: string; at: readonly [number, number]; anchor?: "start" | "end"; dy?: number }[] = [
  { name: "New York", at: project(-74, 40.7), dy: 8 },
  { name: "Los Angeles", at: project(-118.2, 34), anchor: "start" },
  { name: "Toronto", at: project(-79.4, 43.7), anchor: "end", dy: -4 },
  { name: "London", at: project(-0.13, 51.5), anchor: "end", dy: -6 },
  { name: "Antwerp", at: project(4.4, 51.2), anchor: "start", dy: -12 },
  { name: "Zurich", at: project(8.5, 47.4), anchor: "start", dy: 10 },
  { name: "Almaty", at: project(76.9, 43.2), anchor: "start" },
  { name: "Sydney", at: project(151.2, -33.9), anchor: "end" },
];

function arc(from: readonly [number, number], to: readonly [number, number]) {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const dist = Math.hypot(to[0] - from[0], to[1] - from[1]);
  return `M${from[0]},${from[1]} Q${mx},${Math.max(18, my - dist * 0.2)} ${to[0]},${to[1]}`;
}

export default function RouteMap() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-ivory">
      <svg viewBox="0 0 1000 400" className="block h-auto w-full" role="img" aria-label="Map of delivery routes from Surat to international hubs">
        <defs>
          <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" fill="currentColor" className="text-line-strong" />
          </pattern>
        </defs>
        <rect width="1000" height="400" fill="url(#dots)" opacity="0.55" />
        {HUBS.map((h, i) => (
          <motion.path
            key={h.name}
            d={arc(SURAT, h.at)}
            fill="none"
            stroke="currentColor"
            className="text-ink"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.75 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 2.2, delay: 0.2 + i * 0.12, ease: EASE_LUXE }}
          />
        ))}
        {HUBS.map((h) => (
          <g key={`${h.name}-pt`}>
            <circle cx={h.at[0]} cy={h.at[1]} r="3.2" className="fill-ink" />
            <text
              x={h.at[0] + (h.anchor === "end" ? -9 : 9)}
              y={h.at[1] + 4 + (h.dy ?? 0)}
              textAnchor={h.anchor ?? "start"}
              className="fill-ink-soft text-[12px] max-sm:text-[20px]"
            >
              {h.name}
            </text>
          </g>
        ))}
        <circle cx={SURAT[0]} cy={SURAT[1]} r="5" className="fill-ink" />
        <text x={SURAT[0] + 12} y={SURAT[1] + 22} className="fill-ink text-[13px] font-medium max-sm:text-[22px]">
          Surat Diamond Bourse
        </text>
      </svg>
    </div>
  );
}
