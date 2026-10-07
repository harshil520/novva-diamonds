import { FacetMark } from "@/components/ui/icons";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-ink" role="status" aria-live="polite">
      <FacetMark size={34} className="animate-pulse" />
      <span className="eyebrow">Preparing the vault</span>
      <span className="sr-only">Loading</span>
    </div>
  );
}
