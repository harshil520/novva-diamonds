import React from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink, ArrowGlyph } from "@/components/ui/Button";
import JsonLd from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Segment = string | { em: string };

export const GUIDES = [
  { href: "/education/4cs", title: "The 4Cs", short: "Cut, colour, clarity and carat", headline: "The 4Cs of diamonds: cut, colour, clarity and carat" },
  { href: "/education/certification", title: "Certificates", short: "How to check a GIA or IGI report", headline: "GIA and IGI diamond certificates and how to verify one" },
  { href: "/education/natural-vs-lab-grown", title: "Natural vs lab-grown", short: "The differences, simply explained", headline: "Natural vs lab-grown diamonds: the differences" },
];

// First publication of the guides; bump GUIDES_UPDATED when their content changes.
const GUIDES_PUBLISHED = "2026-10-07";
const GUIDES_UPDATED = "2026-10-23";

export function ArticleShell({
  eyebrow,
  title,
  intro,
  crumb,
  current,
  children,
}: {
  eyebrow?: string;
  title: Segment[];
  intro: React.ReactNode;
  crumb: string;
  current: string;
  children: React.ReactNode;
}) {
  const idx = GUIDES.findIndex((g) => g.href === current);
  const next = GUIDES[(idx + 1) % GUIDES.length];
  const guide = GUIDES[idx];

  return (
    <article className="pb-10">
      <JsonLd
        data={[
          articleJsonLd({
            headline: guide?.headline ?? crumb,
            description: typeof intro === "string" ? intro : undefined,
            path: current,
            datePublished: GUIDES_PUBLISHED,
            dateModified: GUIDES_UPDATED,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Diamond Guide", path: "/education" },
            { name: crumb, path: current },
          ]),
        ]}
      />
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        crumbs={[{ label: "Diamond Guide", href: "/education" }, { label: crumb }]}
      />
      <div className="shell grid gap-14 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block" aria-label="Guides">
          <nav className="sticky top-28">
            <p className="eyebrow">Guides</p>
            <ul className="mt-5 space-y-1">
              {GUIDES.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    aria-current={g.href === current ? "page" : undefined}
                    className={cn(
                      "group flex items-baseline gap-3 py-1.5 text-[14px] transition-colors",
                      g.href === current ? "text-ink" : "text-mute hover:text-ink"
                    )}
                  >
                    <span className={g.href === current ? "font-medium" : ""}>{g.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="space-y-20 lg:col-span-8 lg:col-start-5 sm:space-y-28">{children}</div>
      </div>

      <div className="shell mt-28">
        <Link href={next.href} className="group flex flex-col gap-3 border-y border-line py-10 sm:flex-row sm:items-end sm:justify-between">
          <span>
            <span className="eyebrow block">Next guide</span>
            <span className="display mt-3 block text-[2.2rem] leading-none transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-2 sm:text-[3.4rem]">
              {next.title}
            </span>
          </span>
          <span className="inline-flex items-center gap-2 text-[13.5px] text-mute group-hover:text-ink">
            {next.short} <ArrowGlyph />
          </span>
        </Link>
      </div>
    </article>
  );
}

export function ArticleSection({
  index,
  label,
  title,
  children,
}: {
  index?: string;
  label?: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <Reveal>
        {(index || label) && (
          <p className="eyebrow flex items-center gap-3">
            {index && <span className="numeric text-ink">{index}</span>}
            {index && label && <span className="h-px w-6 bg-line-strong" />}
            {label}
          </p>
        )}
        <h2 className="display mt-4 text-[2rem] leading-[1.05] sm:text-[2.8rem]">{title}</h2>
      </Reveal>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <div className="max-w-2xl space-y-5 text-[16px] leading-[1.75] text-ink-soft/90 [&_strong]:font-medium [&_strong]:text-ink">{children}</div>
    </Reveal>
  );
}

export function FactGrid({ items, cols = 2 }: { items: { title: string; body: string }[]; cols?: 2 | 3 | 4 }) {
  return (
    <div className={cn("mt-8 grid gap-px overflow-hidden rounded-[22px] border border-line bg-line", cols === 3 ? "sm:grid-cols-3" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2")}>
      {items.map((it, i) => (
        <Reveal key={it.title} delay={i * 0.05} className="bg-paper p-6 sm:p-7">
          <p className="text-[14.5px] font-medium">{it.title}</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-mute">{it.body}</p>
        </Reveal>
      ))}
    </div>
  );
}

export function ArticleCTA({
  title,
  body,
  actions,
}: {
  title: string;
  body: string;
  actions: { label: string; href: string; variant?: "primary" | "outline" }[];
}) {
  return (
    <Reveal className="rounded-[28px] bg-ink px-7 py-12 text-ivory sm:px-12 sm:py-14">
      <h3 className="display text-[2rem] leading-tight sm:text-[2.6rem]">{title}</h3>
      <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-ivory/60">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {actions.map((a) =>
          a.variant === "outline" ? (
            <Link
              key={a.href}
              href={a.href}
              className="inline-flex h-12 items-center rounded-full border border-ivory/25 px-6 text-[13.5px] font-medium transition-colors hover:border-ivory"
            >
              {a.label}
            </Link>
          ) : (
            <ButtonLink key={a.href} href={a.href} variant="light" size="lg" className="border-transparent">
              {a.label} <ArrowGlyph />
            </ButtonLink>
          )
        )}
      </div>
    </Reveal>
  );
}
