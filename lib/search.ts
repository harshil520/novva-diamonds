import { diamondsData } from "@/data/diamonds";
import type { Diamond } from "@/types/diamond";

/** Multi-parameter lookup used by the global search palette (ID, cert, shape, 4Cs, carat, price). */
export function searchDiamonds(query: string): Diamond[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return diamondsData.filter((d) => d.featured).slice(0, 5);

  const numericQuery = parseFloat(trimmed);

  return diamondsData.filter((diamond) => {
    if (diamond.id.toLowerCase().includes(trimmed)) return true;
    if (diamond.certification.certificateNumber.toLowerCase().includes(trimmed)) return true;
    if (diamond.shape.toLowerCase().includes(trimmed)) return true;
    if (diamond.origin.toLowerCase().includes(trimmed)) return true;
    if (trimmed === "cvd" && diamond.origin === "Lab-Grown") return true;
    if (trimmed === "mined" && diamond.origin === "Natural") return true;
    if (diamond.certification.laboratory.toLowerCase().includes(trimmed)) return true;
    if (trimmed.includes("color") && trimmed.includes(diamond.color.toLowerCase())) return true;
    if (diamond.color.toLowerCase() === trimmed) return true;
    if (diamond.clarity.toLowerCase().includes(trimmed)) return true;
    if (diamond.cut.toLowerCase().includes(trimmed)) return true;
    if (!isNaN(numericQuery)) {
      if (Math.abs(diamond.carat - numericQuery) < 0.15) return true;
      if (numericQuery >= 100 && Math.abs(diamond.indicativePriceUSD - numericQuery) <= 150) return true;
    }
    if (diamond.description?.toLowerCase().includes(trimmed)) return true;
    return false;
  });
}

export const QUICK_SEARCHES = [
  { label: "Natural", q: "Natural" },
  { label: "Lab-grown", q: "Lab-Grown" },
  { label: "Round brilliant", q: "Round" },
  { label: "Oval", q: "Oval" },
  { label: "GIA certified", q: "GIA" },
  { label: "Under $500", q: "400" },
];
