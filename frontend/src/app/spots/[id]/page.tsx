"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bot, CheckCircle2, Gem, ScrollText, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSpot, unlockSpot, visitSpot } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useProgressStore } from "@/stores/progress-store";
import { categoryLabel } from "@/data/categories";
import { defaultImage } from "@/data/fallback-spots";
import { AiGuideChat } from "@/components/spot/AiGuideChat";
import { AnimatedSpotImage } from "@/components/spot/AnimatedSpotImage";
import { BgmPanel } from "@/components/spot/BgmPanel";
import { SpotStoryTabs } from "@/components/spot/SpotStoryTabs";
import { UnlockModal } from "@/components/spot/UnlockModal";
import { GlowButton, GlowLink } from "@/components/ui/GlowButton";
import { RarityStars } from "@/components/ui/RarityStars";
import { StampSeal } from "@/components/stamp/StampSeal";
import type { Spot, SpotMedia } from "@/types/domain";
import { cn } from "@/lib/utils";

export default function SpotDetailPage() {
  const params = useParams<{ id: string }>();
  const spotId = Number(params.id);
  const { token } = useAuthStore();
  const markSpotUnlocked = useProgressStore((state) => state.markSpotUnlocked);
  const queryClient = useQueryClient();
  const [showUnlock, setShowUnlock] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | number | null>(null);

  const { data: spot, isLoading } = useQuery({
    queryKey: ["spot", spotId, token],
    queryFn: () => getSpot(spotId, token),
    enabled: Number.isFinite(spotId),
  });

  const unlock = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error("LOGIN_REQUIRED");
      }

      return unlockSpot(spotId, token);
    },
    onSuccess: (result) => {
      setShowUnlock(true);
      markSpotUnlocked(spotId, result.gained_points);
      queryClient.setQueryData<Spot>(["spot", spotId, token], (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          is_unlocked: true,
          unlocked_at: result.user_progress?.unlocked_at ?? result.collection.unlocked_at ?? current.unlocked_at,
          user_progress: {
            ...current.user_progress,
            ...result.user_progress,
            is_unlocked: true,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ["spot", spotId] });
      queryClient.invalidateQueries({ queryKey: ["spots"] });
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  const visit = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error("LOGIN_REQUIRED");
      }

      return visitSpot(spotId, token);
    },
    onSuccess: (result) => {
      queryClient.setQueryData<Spot>(["spot", spotId, token], (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          is_unlocked: true,
          unlocked_at: result.user_progress?.unlocked_at ?? current.unlocked_at,
          visited_at: result.visited_at,
          user_progress: {
            ...current.user_progress,
            ...result.user_progress,
            is_unlocked: true,
            visited_at: result.visited_at,
            stamp_obtained: result.stamp_obtained,
          },
          stamp: current.stamp
            ? {
                ...current.stamp,
                ...result.stamp,
                is_obtained: result.stamp_obtained || current.stamp.is_obtained,
                obtained_at: result.stamp?.obtained_at ?? current.stamp.obtained_at,
              }
            : result.stamp ?? current.stamp,
          stamp_obtained: result.stamp_obtained || current.stamp_obtained,
          obtained_at: result.stamp?.obtained_at ?? current.obtained_at,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["spot", spotId] });
      queryClient.invalidateQueries({ queryKey: ["spots"] });
      queryClient.invalidateQueries({ queryKey: ["stamps"] });
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
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
                alt={selectedMedia?.alt ?? spot.name}
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
            <MediaThumbnailList media={media} selectedId={selectedMedia?.id} onSelect={setSelectedMediaId} />
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <FeaturePanel className="h-fit self-start lg:row-span-3">
            <AiGuideChat compact spot={spot} />
          </FeaturePanel>
          <div className="grid h-fit gap-4 self-start">
            <FeaturePanel>
              <BgmPanel embedded spot={spot} />
            </FeaturePanel>
            <FeaturePanel>
              <div className="mb-3 flex items-center gap-2 text-cyan-100">
                <Gem className="h-4 w-4" />
                <h2 className="text-sm font-semibold">解放状態</h2>
              </div>
              {token ? (
                <GlowButton className="w-full" onClick={() => unlock.mutate()} disabled={unlock.isPending || spot.is_unlocked}>
                  <Gem className="h-4 w-4" />
                  {unlock.isPending ? "解放中..." : spot.is_unlocked ? "解放済み" : "この絶景を解放する"}
                </GlowButton>
              ) : (
                <GlowLink className="w-full" href="/login">
                  <Gem className="h-4 w-4" />
                  ログインして解放する
                </GlowLink>
              )}
              {!spot.is_unlocked ? <p className="mt-3 text-xs leading-5 text-violet-100/80">{spot.unlock_condition}</p> : null}
              {unlock.isSuccess ? <p className="mt-3 text-center text-sm text-violet-100">解放状態を更新しました。</p> : null}
            </FeaturePanel>
            <FeaturePanel>
              <div className="grid gap-4 sm:grid-cols-[108px_1fr] lg:grid-cols-1">
                {spot.stamp ? <StampSeal stamp={spot.stamp} locked={!spot.stamp.is_obtained} /> : null}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-cyan-100">
                    <ScrollText className="h-4 w-4" />
                    <h2 className="text-sm font-semibold">御朱印</h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {spot.stamp?.is_obtained
                      ? `${spot.stamp.name}を獲得済みです。${spot.stamp.obtained_at ? ` 獲得日時: ${new Date(spot.stamp.obtained_at).toLocaleString("ja-JP")}` : ""}`
                      : "訪問済みにする、または神話クイズに正解すると御朱印を獲得できます。"}
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {token ? (
                      <button
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-cyan-200/20 bg-cyan-500/10 px-4 text-sm text-cyan-50 transition hover:bg-cyan-500/18 disabled:opacity-60"
                        disabled={visit.isPending || Boolean(spot.visited_at)}
                        onClick={() => visit.mutate()}
                        type="button"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {spot.visited_at ? "訪問済み" : visit.isPending ? "記録中..." : "訪問済みにする"}
                      </button>
                    ) : (
                      <GlowLink href="/login">ログインして御朱印を集める</GlowLink>
                    )}
                    <GlowLink href={`/spots/${spot.id}/quiz`}>
                      <Sparkles className="h-4 w-4" />
                      神話クイズに挑戦
                    </GlowLink>
                  </div>
                  {visit.data?.stamp_obtained ? <p className="mt-3 text-sm text-violet-100">御朱印「{visit.data.stamp?.name}」を獲得しました。</p> : null}
                </div>
              </div>
            </FeaturePanel>
          </div>
          <FeaturePanel className="h-fit lg:col-span-2">
            <div className="mb-5 border-b border-white/10 pb-4">
              <p className="text-xs font-semibold tracking-[0.28em] text-cyan-100/60">INTRODUCTION</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{spot.description}</p>
            </div>
            <SpotStoryTabs spot={spot} />
          </FeaturePanel>
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
