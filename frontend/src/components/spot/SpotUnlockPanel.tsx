"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import { Gem } from "lucide-react";
import { GlowButton, GlowLink } from "@/components/ui/GlowButton";
import type { UnlockSpotResponse } from "@/types/api";
import type { Spot } from "@/types/domain";

type SpotUnlockPanelProps = {
  spot: Spot;
  token?: string | null;
  unlock: UseMutationResult<UnlockSpotResponse, Error, void, unknown>;
};

// スポット解放ボタン用の古い互換コンポーネントです。
// 現在の仕様では御朱印獲得時に解放されるため、通常の詳細画面では使っていません。
export function SpotUnlockPanel({ spot, token, unlock }: SpotUnlockPanelProps) {
  return (
    <>
      <div className="mb-3 flex items-center gap-2 text-cyan-100">
        <Gem className="h-4 w-4" />
        <h2 className="text-sm font-semibold">解放状態</h2>
      </div>
      {/* ログイン済みならunlock mutationを実行し、API成功後に親側で状態更新します。 */}
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
      {/* 未解放時だけ、どうすれば解放できるかの説明を表示します。 */}
      {!spot.is_unlocked ? <p className="mt-3 text-xs leading-5 text-violet-100/80">{spot.unlock_condition}</p> : null}
      {unlock.isSuccess ? <p className="mt-3 text-center text-sm text-violet-100">解放状態を更新しました。</p> : null}
    </>
  );
}
