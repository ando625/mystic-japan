"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import { CheckCircle2, ScrollText, Sparkles } from "lucide-react";
import { GlowLink } from "@/components/ui/GlowButton";
import { StampSeal } from "@/components/stamp/StampSeal";
import type { VisitSpotResponse } from "@/types/api";
import type { Spot } from "@/types/domain";

type SpotStampPanelProps = {
  spot: Spot;
  token?: string | null;
  visit: UseMutationResult<VisitSpotResponse, Error, void, unknown>;
};

export function SpotStampPanel({ spot, token, visit }: SpotStampPanelProps) {
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
  );
}
