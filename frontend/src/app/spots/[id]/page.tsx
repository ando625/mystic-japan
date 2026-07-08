"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bot } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSpot } from "@/lib/api";
import { useSpotProgressMutations } from "@/hooks/useSpotProgressMutations";
import { useAuthStore } from "@/stores/auth-store";
import { categoryLabel } from "@/data/categories";
import { AiGuideChat } from "@/components/spot/AiGuideChat";
import { BgmPanel } from "@/components/spot/BgmPanel";
import { SpotDetailMedia } from "@/components/spot/SpotDetailMedia";
import { SpotStampPanel } from "@/components/spot/SpotStampPanel";
import { SpotStoryTabs } from "@/components/spot/SpotStoryTabs";
import { SpotUnlockPanel } from "@/components/spot/SpotUnlockPanel";
import { UnlockModal } from "@/components/spot/UnlockModal";
import { RarityStars } from "@/components/ui/RarityStars";
import type { SpotMedia } from "@/types/domain";
import { cn } from "@/lib/utils";

export default function SpotDetailPage() {
  const params = useParams<{ id: string }>();
  const spotId = Number(params.id);
  const { token } = useAuthStore();
  const [showUnlock, setShowUnlock] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | number | null>(null);

  const { data: spot, isLoading } = useQuery({
    queryKey: ["spot", spotId, token],
    queryFn: () => getSpot(spotId, token),
    enabled: Number.isFinite(spotId),
  });

  const { unlock, visit } = useSpotProgressMutations({
    spotId,
    token,
    onUnlockSuccess: () => setShowUnlock(true),
  });

  const media = useMemo<SpotMedia[]>(() => {
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

  const selectedMedia = media.find((item) => item.id === selectedMediaId) ?? media[0] ?? null;

  if (isLoading || !spot) {
    return <main className="grid min-h-screen place-items-center text-slate-300">神域を読み込み中...</main>;
  }

  const unlockResult = unlock.data;
  const shouldShowUnlockModal = showUnlock && Boolean(unlockResult) && !unlockResult?.already_unlocked;

  return (
    <main className="min-h-screen bg-[#02030a] px-4 pb-40 pt-8 md:px-8">
      <UnlockModal
        achievements={unlock.data?.new_achievements ?? []}
        onClose={() => setShowUnlock(false)}
        open={shouldShowUnlockModal}
        points={unlock.data?.gained_points ?? spot.mystic_points}
        spotName={spot.name}
      />
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
              <SpotUnlockPanel spot={spot} token={token} unlock={unlock} />
            </FeaturePanel>
            <FeaturePanel>
              <SpotStampPanel spot={spot} token={token} visit={visit} />
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

function FeaturePanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("h-fit rounded-[8px] border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}
