import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TextReveal, Reveal } from "./Reveal";

type Segment = string | { em: string };

export default function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
  aside,
}: {
  eyebrow: string;
  title: Segment[];
  intro?: React.ReactNode;
  crumbs?: { label: string; href?: string }[];
  aside?: React.ReactNode;
}) {
  return (
    <header className="shell pb-14 pt-[calc(72px+2.5rem)] sm:pb-20 sm:pt-[calc(72px+4rem)]">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-1.5 text-[12px] text-mute">
          {crumbs.map((c, i) => (
            <React.Fragment key={c.label}>
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {c.href ? (
                <Link href={c.href} className="link-draw hover:text-ink">
                  {c.label}
                </Link>
              ) : (
                <span className="text-ink">{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="grid items-end gap-10 lg:grid-cols-12">
        <div className={aside ? "lg:col-span-7" : "lg:col-span-10"}>
          <Reveal>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
          <TextReveal as="h1" immediate segments={title} className="display mt-5 text-[clamp(2.7rem,6.4vw,6rem)] leading-[0.97]" />
          {intro && (
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-2xl text-[16px] leading-relaxed text-ink-soft/85 sm:text-[17px]">{intro}</p>
            </Reveal>
          )}
        </div>
        {aside && <div className="lg:col-span-5">{aside}</div>}
      </div>
    </header>
  );
}
