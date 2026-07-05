"use client";

import Image from "next/image";
import { useState } from "react";
import { defaultImage } from "@/data/fallback-spots";
import { cn } from "@/lib/utils";

export function SpotImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src || defaultImage);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Image
        fill
        unoptimized
        alt={alt}
        className="object-cover"
        sizes="(min-width: 1024px) 33vw, 100vw"
        src={currentSrc}
        onError={() => setCurrentSrc(defaultImage)}
      />
    </div>
  );
}
