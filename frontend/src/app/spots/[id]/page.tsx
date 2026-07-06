"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bot, Gem, Heart, ImageIcon, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSpot, unlockSpot } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { categoryLabel } from "@/data/categories";
import { AiGuideChat } from "@/components/spot/AiGuideChat";
import { AnimatedSpotImage } from "@/components/spot/AnimatedSpotImage";
import { BgmPanel } from "@/components/spot/BgmPanel";
import { CinematicSpotModal } from "@/components/spot/CinematicSpotModal";
import { ImageThumbnailList } from "@/components/spot/ImageThumbnailList";
import { SpotStoryTabs } from "@/components/spot/SpotStoryTabs";
import { UnlockModal } from "@/components/spot/UnlockModal";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton, GlowLink } from "@/components/ui/GlowButton";
import { RarityStars } from "@/components/ui/RarityStars";

export default function SpotDetailPage() {
  const params = useParams<{ id: string }>();
  const spotId = Number(params.id);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [showUnlock, setShowUnlock] = useState(false);
  const [showCinematic, setShowCinematic] = useState(false);
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
    onSuccess: () => {
      setShowUnlock(true);
      queryClient.invalidateQueries({ queryKey: ["spot", spotId] });
      queryClient.invalidateQueries({ queryKey: ["spots"] });
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
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
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <UnlockModal
        achievements={unlock.data?.new_achievements ?? []}
        onClose={() => setShowUnlock(false)}
        open={shouldShowUnlockModal}
        points={unlock.data?.gained_points ?? spot.mystic_points}
        spotName={spot.name}
      />
      <CinematicSpotModal open={showCinematic} spot={spot} onClose={() => setShowCinematic(false)} />
      <Link className="mb-5 inline-flex items-center gap-2 text-sm text-cyan-100/80 hover:text-white" href="/spots">
        <ArrowLeft className="h-4 w-4" />
        図鑑へ戻る
      </Link>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
        <div className="space-y-4">
          <GlassPanel glow className="overflow-hidden">
            <div className="relative aspect-[16/10] min-h-[420px]">
              <AnimatedSpotImage alt={spot.name} priority src={mainImage} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/8 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
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
          </GlassPanel>

          <ImageThumbnailList images={images} selected={mainImage ?? ""} onSelect={setSelectedImage} />

          <GlassPanel className="p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                className="grid min-h-16 place-items-center rounded-[8px] border border-violet-300/20 bg-slate-950/42 text-xs text-slate-200 transition hover:border-cyan-100/45 hover:bg-cyan-500/12"
                onClick={() => setShowCinematic(true)}
                type="button"
              >
                <ImageIcon className="mb-1 h-5 w-5 text-cyan-100" />
                幻想鑑賞
              </button>
              <button className="grid min-h-16 place-items-center rounded-[8px] border border-violet-300/20 bg-slate-950/42 text-xs text-slate-200" type="button">
                <Play className="mb-1 h-5 w-5 text-cyan-100" />
                BGM
              </button>
              <button className="grid min-h-16 place-items-center rounded-[8px] border border-violet-300/20 bg-slate-950/42 text-xs text-slate-200" type="button">
                <Sparkles className="mb-1 h-5 w-5 text-cyan-100" />
                記憶
              </button>
              <button className="grid min-h-16 place-items-center rounded-[8px] border border-violet-300/20 bg-slate-950/42 text-xs text-slate-200" type="button">
                <Heart className="mb-1 h-5 w-5 text-cyan-100" />
                保存
              </button>
            </div>
            <div className="mt-5">
              {token ? (
                <GlowButton className="w-full" onClick={() => unlock.mutate()} disabled={unlock.isPending}>
                  <Gem className="h-4 w-4" />
                  {unlock.isPending ? "解放中..." : spot.is_unlocked ? "解放済み" : "この絶景を解放する"}
                </GlowButton>
              ) : (
                <GlowLink className="w-full" href="/login">
                  <Gem className="h-4 w-4" />
                  ログインして解放する
                </GlowLink>
              )}
              {unlock.isSuccess ? (
                <p className="mt-3 text-center text-sm text-violet-100">神秘ポイントを獲得しました。</p>
              ) : null}
            </div>
          </GlassPanel>
        </div>

        <div className="space-y-4">
          <AiGuideChat compact spot={spot} />
          <SpotStoryTabs spot={spot} />
          <BgmPanel spot={spot} />
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
