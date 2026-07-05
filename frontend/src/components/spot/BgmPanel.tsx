"use client";

import { Pause, Play } from "lucide-react";
import type { Spot } from "@/types/domain";
import { useBgmStore } from "@/stores/bgm-store";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { SpotImage } from "@/components/spot/SpotImage";

export function BgmPanel({ spot }: { spot: Spot }) {
  const { currentTrack, isPlaying, pause, playSpot } = useBgmStore();
  const active = currentTrack?.id === `spot-${spot.id}` && isPlaying;

  return (
    <GlassPanel glow className="p-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-violet-200/40 shadow-[0_0_28px_rgba(168,85,247,0.38)]">
          <SpotImage alt={`${spot.name} BGM`} src={spot.image_url} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-cyan-100/65">神域の調べ</p>
          <h3 className="truncate text-lg font-semibold text-white">{spot.name}のBGM</h3>
          <p className="mt-1 text-sm text-slate-300">{spot.music_url ? "再生準備完了" : "BGM準備中"}</p>
        </div>
        <GlowButton disabled={!spot.music_url} onClick={() => (active ? pause() : playSpot(spot))} aria-label="BGM再生">
          {active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </GlowButton>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-1/3 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(168,85,247,0.8)]" />
      </div>
    </GlassPanel>
  );
}
