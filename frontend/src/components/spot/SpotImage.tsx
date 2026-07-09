"use client";

import Image from "next/image";
import { useState } from "react";
import { defaultImage } from "@/data/fallback-spots";
import { cn } from "@/lib/utils";

// 一覧カードやBGMパネルで使う、通常のスポット画像コンポーネントです。
export function SpotImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  // 画像パスが無い、または読み込みに失敗した場合は共通のデフォルト画像を表示します。
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
