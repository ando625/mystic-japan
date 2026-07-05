"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bot, Gem, Heart, ImageIcon, Play, ScrollText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSpot, unlockSpot } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { categoryLabel } from "@/data/categories";
import { cn } from "@/lib/utils";
import { AiGuideChat } from "@/components/spot/AiGuideChat";
import { BgmPanel } from "@/components/spot/BgmPanel";
import { SpotImage } from "@/components/spot/SpotImage";
import { UnlockModal } from "@/components/spot/UnlockModal";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton, GlowLink } from "@/components/ui/GlowButton";
import { RarityStars } from "@/components/ui/RarityStars";

const tabs = [
  { key: "mythology", label: "神話・伝説" },
  { key: "history", label: "歴史" },
  { key: "trivia", label: "豆知識" },
] as const;

export default function SpotDetailPage() {
  const params = useParams<{ id: string }>();
  const spotId = Number(params.id);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("mythology");
  const [showUnlock, setShowUnlock] = useState(false);

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

  const lore = useMemo(() => {
    if (!spot) {
      return "";
    }

    return spot[tab] || "この記憶はまだ霧の向こうにあります。";
  }, [spot, tab]);

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
      <Link className="mb-5 inline-flex items-center gap-2 text-sm text-cyan-100/80 hover:text-white" href="/spots">
        <ArrowLeft className="h-4 w-4" />
        図鑑へ戻る
      </Link>

      <section className="grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
        <GlassPanel glow className="overflow-hidden">
          <div className="relative aspect-[16/11] min-h-[360px]">
            <SpotImage alt={spot.name} src={spot.image_url} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-sm text-cyan-100/75">{categoryLabel[spot.category]} / {spot.prefecture}</p>
              <h1 className="mt-2 text-4xl font-semibold text-white text-glow md:text-6xl">{spot.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <RarityStars value={spot.rarity} />
                <span className="rounded-full border border-violet-300/30 bg-violet-500/18 px-3 py-1 text-sm text-violet-100">
                  {spot.mystic_points} pt
                </span>
              </div>
            </div>
          </div>
        </GlassPanel>

        <div className="space-y-5">
          <GlassPanel className="p-5">
            <p className="text-sm leading-7 text-slate-200/82">{spot.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button className="grid min-h-16 place-items-center rounded-[8px] border border-violet-300/20 bg-slate-950/42 text-xs text-slate-200">
                <ImageIcon className="mb-1 h-5 w-5 text-cyan-100" />
                ギャラリー
              </button>
              <button className="grid min-h-16 place-items-center rounded-[8px] border border-violet-300/20 bg-slate-950/42 text-xs text-slate-200">
                <Play className="mb-1 h-5 w-5 text-cyan-100" />
                BGM
              </button>
              <button className="grid min-h-16 place-items-center rounded-[8px] border border-violet-300/20 bg-slate-950/42 text-xs text-slate-200">
                <ScrollText className="mb-1 h-5 w-5 text-cyan-100" />
                物語
              </button>
              <button className="grid min-h-16 place-items-center rounded-[8px] border border-violet-300/20 bg-slate-950/42 text-xs text-slate-200">
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

          <BgmPanel spot={spot} />
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <GlassPanel className="p-5">
          <div className="mb-5 grid grid-cols-3 gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={cn(
                  "min-h-11 rounded-[8px] border border-violet-300/20 bg-slate-950/42 text-sm text-slate-300 transition",
                  tab === item.key && "border-violet-200/60 bg-violet-500/30 text-white shadow-[0_0_22px_rgba(168,85,247,0.24)]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-sm leading-8 text-slate-200/86">{lore}</p>
        </GlassPanel>

        <div className="space-y-3">
          <AiGuideChat compact spot={spot} />
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
