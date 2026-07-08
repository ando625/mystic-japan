"use client";

import Image from "next/image";
import { defaultImage } from "@/data/fallback-spots";
import { AnimatedSpotImage } from "@/components/spot/AnimatedSpotImage";
import type { SpotMedia } from "@/types/domain";
import { cn } from "@/lib/utils";

type SpotDetailMediaProps = {
  media: SpotMedia[];
  selectedMedia: SpotMedia | null;
  onSelect: (id: string | number) => void;
};

export function SpotDetailMedia({ media, selectedMedia, onSelect }: SpotDetailMediaProps) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-video min-h-[320px] max-h-[72vh] w-full overflow-hidden bg-black md:min-h-[520px]">
        {selectedMedia?.type === "video" ? (
          <video
            autoPlay
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            src={selectedMedia.url}
          />
        ) : (
          <AnimatedSpotImage
            alt={selectedMedia?.alt ?? "神秘スポット"}
            className="h-full w-full"
            key={selectedMedia?.url || defaultImage}
            objectPosition={selectedMedia?.objectPosition ?? "center center"}
            priority
            sizes="100vw"
            src={selectedMedia?.url || defaultImage}
          />
        )}
      </div>

      <div className="mx-auto w-full max-w-7xl">
        <MediaThumbnailList media={media} selectedId={selectedMedia?.id} onSelect={onSelect} />
      </div>
    </div>
  );
}

function MediaThumbnailList({
  media,
  selectedId,
  onSelect,
}: {
  media: SpotMedia[];
  selectedId?: string | number;
  onSelect: (id: string | number) => void;
}) {
  if (media.length <= 1) {
    return null;
  }

  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
      {media.map((item, index) => (
        <button
          aria-label={`${item.type === "video" ? "動画" : "画像"}${index + 1}を表示`}
          className={cn(
            "relative h-16 w-24 shrink-0 overflow-hidden rounded-[6px] bg-black transition",
            selectedId === item.id ? "ring-2 ring-cyan-100/70" : "opacity-70 hover:opacity-100",
          )}
          key={item.id}
          onClick={() => onSelect(item.id)}
          type="button"
        >
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="96px"
            src={item.thumbnailUrl || item.url || defaultImage}
            unoptimized
          />
          {item.type === "video" ? (
            <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">VIDEO</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
