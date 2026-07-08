"use client";

import { ScrollText, Sparkles } from "lucide-react";
import { GlowLink } from "@/components/ui/GlowButton";
import { StampSeal } from "@/components/stamp/StampSeal";
import type { Spot } from "@/types/domain";

type SpotStampPanelProps = {
  spot: Spot;
  token?: string | null;
};

export function SpotStampPanel({ spot, token }: SpotStampPanelProps) {
  return (
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
            : "神話クイズで4問中3問以上正解すると、御朱印を獲得してこの絶景が解放されます。"}
        </p>
        <div className="mt-4 grid gap-2">
          {token ? (
            <GlowLink href={`/spots/${spot.id}/quiz`}>
              <Sparkles className="h-4 w-4" />
              神話クイズに挑戦
            </GlowLink>
          ) : (
            <GlowLink href="/login">ログインして御朱印を集める</GlowLink>
          )}
        </div>
      </div>
    </div>
  );
}
