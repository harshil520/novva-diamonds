import Link from "next/link";
import { ButtonLink, ArrowGlyph } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[82vh] flex-col items-center justify-center pt-24 text-center">
      <p className="display select-none text-[34vw] leading-none text-ink/[0.06] sm:text-[18rem]" aria-hidden="true">
        404
      </p>
      <div className="-mt-[12vw] sm:-mt-36">
        <h1 className="display text-5xl sm:text-6xl">Page not found</h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-mute">
          This page or diamond is no longer available.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <ButtonLink href="/diamonds">
            View diamonds <ArrowGlyph />
          </ButtonLink>
          <Link href="/contact" className="link-draw text-[13.5px] font-medium">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
