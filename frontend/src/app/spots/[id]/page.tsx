"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bot, CheckCircle2, Gem, ScrollText, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSpot, unlockSpot, visitSpot } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useProgressStore } from "@/stores/progress-store";
import { categoryLabel } from "@/data/categories";
import { AiGuideChat } from "@/components/spot/AiGuideChat";
import { AnimatedSpotImage } from "@/components/spot/AnimatedSpotImage";
import { BgmPanel } from "@/components/spot/BgmPanel";
import { ImageThumbnailList } from "@/components/spot/ImageThumbnailList";
import { SpotImage } from "@/components/spot/SpotImage";
import { SpotStoryTabs } from "@/components/spot/SpotStoryTabs";
import { UnlockModal } from "@/components/spot/UnlockModal";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton, GlowLink } from "@/components/ui/GlowButton";
import { RarityStars } from "@/components/ui/RarityStars";
import { StampSeal } from "@/components/stamp/StampSeal";

export default function SpotDetailPage() {
  const params = useParams<{ id: string }>();
  const spotId = Number(params.id);
  const { token } = useAuthStore();
  const markSpotUnlocked = useProgressStore((state) => state.markSpotUnlocked);
  const queryClient = useQueryClient();
  const [showUnlock, setShowUnlock] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spot", spotId] });
      queryClient.invalidateQueries({ queryKey: ["spots"] });
      queryClient.invalidateQueries({ queryKey: ["stamps"] });
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });

  const images = useMemo(() => {
    if (!spot) {
      return [];
    }

    return Array.from(new Set([...(spot.images ?? []), spot.image_url].filter(Boolean) as string[]));
  }, [spot]);

  const mainImage = selectedImage ?? images[0] ?? spot?.image_url ?? null;

  if (isLoading || !spot) {
    return <main className="grid min-h-screen place-items-center text-slate-300">神域を読み込み中...</main>;
  }

  const unlockResult = unlock.data;
  const shouldShowUnlockModal = showUnlock && Boolean(unlockResult) && !unlockResult?.already_unlocked;

  return (
    <main className="relative isolate mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div aria-hidden className="fixed inset-0 z-0">
        <SpotImage alt={`${spot.name} 背景`} src={mainImage} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,22,0.84),rgba(5,8,22,0.42)_48%,rgba(5,8,22,0.82)),linear-gradient(180deg,rgba(5,8,22,0.08),rgba(5,8,22,0.76)_62%,rgba(5,8,22,0.98))]" />
      </div>
      <UnlockModal
        achievements={unlock.data?.new_achievements ?? []}
        onClose={() => setShowUnlock(false)}
        open={shouldShowUnlockModal}
        points={unlock.data?.gained_points ?? spot.mystic_points}
        spotName={spot.name}
      />
      <Link className="relative z-10 mb-5 inline-flex items-center gap-2 text-sm text-cyan-100/80 hover:text-white" href="/spots">
        <ArrowLeft className="h-4 w-4" />
        図鑑へ戻る
      </Link>

      <section className="relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
        <div className="space-y-4">
          <div className="relative -mx-4 overflow-hidden md:-mx-8 xl:mx-0">
            <div className="relative min-h-[640px] overflow-hidden xl:rounded-[8px]">
              <AnimatedSpotImage alt={spot.name} className="bg-transparent" priority src={mainImage} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/18 to-slate-950/18" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                <div className="max-w-3xl">
                  <p className="text-sm text-cyan-100/75">{categoryLabel[spot.category]} / {spot.prefecture}</p>
                  <h1 className="mt-2 text-5xl font-semibold text-white text-glow md:text-7xl">{spot.name}</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100/82">{spot.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <RarityStars value={spot.rarity} />
                    <span className="rounded-full border border-violet-300/30 bg-violet-500/18 px-3 py-1 text-sm text-violet-100">
                      {spot.mystic_points} pt
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ImageThumbnailList images={images} selected={mainImage ?? ""} onSelect={setSelectedImage} />
        </div>

        <div className="space-y-4">
          <AiGuideChat compact spot={spot} />
          <BgmPanel spot={spot} />
          <GlassPanel className="p-4">
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
            {!spot.is_unlocked ? (
              <p className="mt-3 text-xs leading-5 text-violet-100/80">{spot.unlock_condition}</p>
            ) : null}
            {unlock.isSuccess ? (
              <p className="mt-3 text-center text-sm text-violet-100">神秘ポイントを獲得しました。</p>
            ) : null}
          </GlassPanel>
          <GlassPanel glow={Boolean(spot.stamp?.is_obtained)} className="p-4">
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              {spot.stamp ? <StampSeal stamp={spot.stamp} locked={!spot.stamp.is_obtained} /> : null}
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-cyan-100">
                  <ScrollText className="h-5 w-5" />
                  <p className="text-xs tracking-[0.3em]">GOSHUIN</p>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-white">御朱印の記憶</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {spot.stamp?.is_obtained
                    ? `${spot.stamp.name}を授与済みです。`
                    : "訪問済みにする、または神話クイズに正解すると御朱印を獲得できます。"}
                </p>
                <div className="mt-4 grid gap-2">
                  {token ? (
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-cyan-200/25 bg-cyan-500/10 px-4 text-sm text-cyan-50 transition hover:bg-cyan-500/18 disabled:opacity-60"
                      disabled={visit.isPending}
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
                {visit.data?.stamp_obtained ? (
                  <p className="mt-3 text-sm text-violet-100">御朱印「{visit.data.stamp?.name}」を獲得しました。</p>
                ) : null}
              </div>
            </div>
          </GlassPanel>
          <SpotStoryTabs spot={spot} />
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-cyan-200/25 bg-cyan-500/10 text-sm text-cyan-50 transition hover:bg-cyan-500/18"
            href={`/spots/${spot.id}/guide`}
          >
            <Bot className="h-4 w-4" />
            大きな画面で相談する
          </Link>
        </div>
      </section>
    </main>
  );
}
