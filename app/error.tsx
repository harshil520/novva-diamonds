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
      <h1 className="display mt-8 text-5xl sm:text-6xl">Something went wrong</h1>
      <p className="mt-5 max-w-md text-[15px] leading-relaxed text-mute">Please try again.</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/diamonds" className="link-draw text-[13.5px] font-medium">
          View diamonds
        </Link>
      </div>
    </div>
  );
}
