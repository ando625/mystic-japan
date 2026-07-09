"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bot } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSpot } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { categoryLabel } from "@/data/categories";
import { AiGuideChat } from "@/components/spot/AiGuideChat";
import { BgmPanel } from "@/components/spot/BgmPanel";
import { SpotDetailMedia } from "@/components/spot/SpotDetailMedia";
import { SpotStampPanel } from "@/components/spot/SpotStampPanel";
import { SpotStoryTabs } from "@/components/spot/SpotStoryTabs";
import { RarityStars } from "@/components/ui/RarityStars";
import type { SpotMedia } from "@/types/domain";
import { cn } from "@/lib/utils";

// スポット詳細画面: 絶景メディア、AIガイド、BGM、御朱印、物語タブをまとめて表示します。
export default function SpotDetailPage() {
  const params = useParams<{ id: string }>();
  const spotId = Number(params.id);
  const { token } = useAuthStore();
  // サムネイルクリック時に選択中メディアを切り替えるための状態です。
  const [selectedMediaId, setSelectedMediaId] = useState<string | number | null>(null);

  // ログイン中は、このスポットの解放状態・御朱印状態も一緒に取得します。
  const { data: spot, isLoading } = useQuery({
    queryKey: ["spot", spotId, token],
    queryFn: () => getSpot(spotId, token),
    enabled: Number.isFinite(spotId),
  });

  const media = useMemo<SpotMedia[]>(() => {
    // APIがmedia配列を返す場合はそれを優先し、なければ画像URLと動画URLから表示用データを作ります。
    if (!spot) {
      return [];
    }

    if (spot.media?.length) {
      return spot.media;
    }

    const imageMedia = Array.from(new Set([...(spot.images ?? []), spot.image_url].filter(Boolean) as string[])).map(
      (url, index) => ({
        id: `image-${index}`,
        type: "image" as const,
        url,
        thumbnailUrl: url,
        alt: spot.name,
      }),
    );

    return spot.video_url
      ? [
          ...imageMedia,
          {
            id: "video-main",
            type: "video" as const,
            url: spot.video_url,
            thumbnailUrl: spot.image_url,
            alt: `${spot.name} 動画`,
          },
        ]
      : imageMedia;
  }, [spot]);

  // メインビューアは常に選択中の画像/動画を参照します。
  const selectedMedia = media.find((item) => item.id === selectedMediaId) ?? media[0] ?? null;

  if (isLoading || !spot) {
    return <main className="grid min-h-screen place-items-center text-slate-300">神域を読み込み中...</main>;
  }

  return (
    <main className="min-h-screen bg-[#02030a] px-4 pb-40 pt-8 md:px-8">
      <Link className="mb-5 inline-flex items-center gap-2 text-sm text-cyan-100/80 hover:text-white" href="/spots">
        <ArrowLeft className="h-4 w-4" />
        図鑑へ戻る
      </Link>

      <section className="mx-auto max-w-none space-y-6">
        <div className="space-y-4">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
            <p className="text-xs text-cyan-100/70 md:text-sm">
              {categoryLabel[spot.category]} / {spot.prefecture}
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h1 className="text-2xl font-semibold text-white drop-shadow-[0_0_18px_rgba(221,214,254,0.45)] md:text-3xl">
                {spot.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <RarityStars value={spot.rarity} />
                <span className="rounded-full border border-violet-300/20 bg-white/5 px-3 py-1 text-xs text-violet-100">
                  {spot.mystic_points} pt
                </span>
              </div>
            </div>
          </div>

          <SpotDetailMedia media={media} selectedMedia={selectedMedia} onSelect={setSelectedMediaId} />
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid h-fit gap-4 self-start">
            <FeaturePanel>
              <AiGuideChat compact spot={spot} />
            </FeaturePanel>
            <FeaturePanel>
              <div className="mb-5 border-b border-white/10 pb-4">
                <p className="text-xs font-semibold tracking-[0.28em] text-cyan-100/60">INTRODUCTION</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{spot.description}</p>
              </div>
              <SpotStoryTabs spot={spot} />
            </FeaturePanel>
          </div>
          <div className="grid h-fit gap-4 self-start">
            <FeaturePanel>
              <BgmPanel embedded spot={spot} />
            </FeaturePanel>
            <FeaturePanel>
              <SpotStampPanel spot={spot} token={token} />
            </FeaturePanel>
          </div>
          <FeaturePanel className="h-fit lg:col-span-2">
            <Link
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-cyan-200/20 bg-cyan-500/10 text-sm text-cyan-50 transition hover:bg-cyan-500/18"
              href={`/spots/${spot.id}/guide`}
            >
              <Bot className="h-4 w-4" />
              大きな画面で相談する
            </Link>
          </FeaturePanel>
        </div>
      </section>
    </main>
  );
}

// 詳細画面内の小さな情報ブロックを統一するための共通枠です。
function FeaturePanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("h-fit rounded-[8px] border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}
