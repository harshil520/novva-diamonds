import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowGlyph } from "@/components/ui/Button";
import { GUIDES } from "@/components/education/Article";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Diamond Buying Guide: 4Cs and Certificates",
  description:
    "Plain-English guides to buying a diamond: the 4Cs, how to read and verify a GIA or IGI certificate, and how natural and lab-grown diamonds differ.",
  path: "/education",
});

export default function EducationHubPage() {
  return (
    <div className="pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Diamond Guide", path: "/education" },
        ])}
      />
      <PageHeader title={["Diamond", { em: "guide" }]} intro="Short, simple guides to help you choose a diamond." />
      <div className="shell">
        <ol className="border-t border-ink">
          {GUIDES.map((a, i) => (
            <Reveal as="li" key={a.href} delay={i * 0.05}>
              <Link
                href={a.href}
                className="group relative grid grid-cols-[1fr_auto] items-center gap-4 overflow-hidden border-b border-line py-8 sm:grid-cols-[1.2fr_1fr_auto] sm:gap-8 sm:py-10"
              >
                <span aria-hidden="true" className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-porcelain transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-y-100" />
                <span className="display block text-[1.9rem] leading-[1.02] transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-2 sm:pl-4 sm:text-[2.8rem]">
                  {a.title}
                </span>
                <span className="col-span-2 max-w-md text-[14px] leading-relaxed text-mute sm:col-span-1">{a.short}</span>
                <span className="col-start-2 row-start-1 flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory sm:col-start-3 sm:mr-4">
                  <ArrowGlyph />
                </span>
              </Link>
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  );
}
