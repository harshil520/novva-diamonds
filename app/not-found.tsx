import Link from "next/link";
import { ButtonLink, ArrowGlyph } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[82vh] flex-col items-center justify-center pt-24 text-center">
      <p className="display select-none text-[34vw] leading-none text-ink/[0.06] sm:text-[18rem]" aria-hidden="true">
        404
      </p>
      <div className="-mt-[12vw] sm:-mt-36">
        <p className="eyebrow">Not in the vault</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">
          This stone has <em>moved on.</em>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-mute">
          The diamond or page you are looking for may have been reserved, traded, or relocated within our catalogue.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <ButtonLink href="/diamonds">
            Browse the collection <ArrowGlyph />
          </ButtonLink>
          <Link href="/contact" className="link-draw text-[13.5px] font-medium">
            Ask us to source it
          </Link>
        </div>
      </div>
    </div>
  );
}
