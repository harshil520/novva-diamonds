"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FacetMark } from "@/components/ui/icons";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell flex min-h-[78vh] flex-col items-center justify-center pt-24 text-center">
      <FacetMark size={36} className="text-mute" />
      <p className="eyebrow mt-8">Something went amiss</p>
      <h1 className="display mt-4 text-5xl sm:text-6xl">A brief interruption.</h1>
      <p className="mt-5 max-w-md text-[15px] leading-relaxed text-mute">
        This page could not be displayed. Please try again — or return to the collection while we polish things up.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/diamonds" className="link-draw text-[13.5px] font-medium">
          Return to the collection
        </Link>
      </div>
    </div>
  );
}
