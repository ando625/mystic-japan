"use client";

import Image from "next/image";
import { defaultImage } from "@/data/fallback-spots";
import { cn } from "@/lib/utils";

export function ImageThumbnailList({
  images,
  selected,
  onSelect,
}: {
  images: string[];
  selected: string;
  onSelect: (src: string) => void;
}) {
  if (images.length <= 1) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {images.map((src, index) => (
        <button
          aria-label={`画像${index + 1}を表示`}
          className={cn(
            "relative h-16 w-24 shrink-0 overflow-hidden rounded-[8px] border bg-slate-950 transition",
            selected === src
              ? "border-cyan-100/75 shadow-[0_0_22px_rgba(56,189,248,0.35)]"
              : "border-violet-300/20 opacity-72 hover:border-violet-200/50 hover:opacity-100",
          )}
          key={`${src}-${index}`}
          onClick={() => onSelect(src)}
          type="button"
        >
          <Image alt="" className="object-cover" fill sizes="96px" src={src || defaultImage} unoptimized />
        </button>
      ))}
    </div>
  );
}
