import React from "react";
import Image from "next/image";
import { getDiamondImage } from "@/lib/diamondImages";
import { cn } from "@/lib/utils";

/** Studio photograph of a cut, rendered strictly colourless. */
export default function DiamondPhoto({
  shape,
  alt,
  className,
  sizes = "200px",
  priority,
}: {
  shape: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={getDiamondImage(shape)}
      alt={alt}
      sizes={sizes}
      priority={priority}
      className={cn("diamond-photo h-full w-full object-contain", className)}
    />
  );
}
