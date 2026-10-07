import React from "react";
import Link from "next/link";
import { TextReveal, Reveal } from "./Reveal";
import { ArrowGlyph } from "./Button";
import { cn } from "@/lib/utils";

type Segment = string | { em: string };

export default function SectionIntro({
  eyebrow,
  title,
  description,
  action,
  align = "split",
  className,
  as = "h2",
}: {
  eyebrow: string;
  title: Segment[];
  description?: React.ReactNode;
  action?: { label: string; href: string };
  align?: "split" | "center" | "left";
  className?: string;
  as?: "h1" | "h2";
}) {
  if (align === "center") {
    return (
      <div className={cn("mx-auto max-w-3xl text-center", className)}>
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <TextReveal as={as} segments={title} className="display mt-5 text-[clamp(2.3rem,4.8vw,4.4rem)] leading-[1.02]" />
        {description && (
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-mute">{description}</p>
          </Reveal>
        )}
      </div>
    );
  }
  return (
    <div className={cn("grid items-end gap-6 lg:grid-cols-12 lg:gap-8", className)}>
      <div className={align === "left" ? "lg:col-span-9" : "lg:col-span-7"}>
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <TextReveal as={as} segments={title} className="display mt-5 text-[clamp(2.3rem,4.8vw,4.4rem)] leading-[1.02]" />
      </div>
      {(description || action) && align === "split" && (
        <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.12}>
          {description && <p className="text-[15px] leading-relaxed text-mute">{description}</p>}
          {action && (
            <Link href={action.href} className="group mt-5 inline-flex items-center gap-2 text-[13.5px] font-medium">
              <span className="link-draw">{action.label}</span> <ArrowGlyph />
            </Link>
          )}
        </Reveal>
      )}
      {description && align === "left" && (
        <Reveal className="lg:col-span-7" delay={0.12}>
          <p className="text-[15px] leading-relaxed text-mute">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
