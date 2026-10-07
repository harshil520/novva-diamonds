import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-medium tracking-[0.01em] whitespace-nowrap transition-[color,background-color,border-color,transform,box-shadow] duration-500 ease-[var(--ease-luxe)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-offset-4";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-ivory hover:shadow-[0_14px_40px_-14px_rgb(18_18_18/0.55)] [--sheen:rgb(255_255_255/0.14)]",
  outline:
    "border border-ink/20 text-ink hover:border-ink bg-transparent [--sheen:rgb(18_18_18/0.05)]",
  ghost: "text-ink hover:bg-ink/5 [--sheen:transparent]",
  light: "bg-paper text-ink border border-line hover:border-ink/40 [--sheen:rgb(18_18_18/0.04)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[12.5px]",
  md: "h-11 px-6 text-[13.5px]",
  lg: "h-14 px-8 text-[14px]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

/** A light sweep across the button on hover */
function Sheen() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-[var(--sheen)] opacity-0 transition-all duration-700 ease-[var(--ease-luxe)] group-hover/btn:left-[120%] group-hover/btn:opacity-100"
    />
  );
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses(variant, size, className)} {...props}>
      <Sheen />
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  children,
  href,
  external,
  ...props
}: CommonProps & { href: string; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = buttonClasses(variant, size, className);
  if (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a
        href={href}
        className={cls}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        <Sheen />
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      <Sheen />
      {children}
    </Link>
  );
}

/** Arrow that nudges forward on parent hover */
export function ArrowGlyph({ className, diagonal = false }: { className?: string; diagonal?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
      className={cn(
        "shrink-0 transition-transform duration-500 ease-[var(--ease-luxe)]",
        diagonal
          ? "group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          : "group-hover/btn:translate-x-1 group-hover:translate-x-1",
        className
      )}
    >
      {diagonal ? <path d="M3.5 10.5 10.5 3.5M4.5 3.5h6v6" /> : <path d="M1 7h11.5M8 2.5 12.5 7 8 11.5" />}
    </svg>
  );
}
