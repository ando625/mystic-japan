"use client";

import { useState } from "react";
import type { Spot } from "@/types/domain";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/GlassPanel";

const storyTabs = [
  // Spot型のキーと表示ラベルを対応させています。
  { key: "mythology", label: "神話" },
  { key: "history", label: "歴史" },
  { key: "trivia", label: "豆知識" },
] as const;

// 神話・歴史・豆知識をタブで切り替える説明パネルです。
export function SpotStoryTabs({ spot }: { spot: Spot }) {
  // 現在選択中のタブです。初期表示は神話にしています。
  const [tab, setTab] = useState<(typeof storyTabs)[number]["key"]>("mythology");

  // 選択中タブの本文をSpotから取り出します。空なら未登録メッセージを表示します。
  const text = spot[tab] || "この記憶はまだ霧の向こうにあります。";

  return (
    <GlassPanel className="p-4">
      <div className="grid grid-cols-3 gap-2">
        {storyTabs.map((item) => (
          <button
            className={cn(
              "min-h-10 rounded-[8px] border border-violet-300/20 bg-slate-950/42 text-xs text-slate-300 transition",
              tab === item.key && "border-violet-200/60 bg-violet-500/30 text-white shadow-[0_0_18px_rgba(168,85,247,0.2)]",
            )}
            key={item.key}
            onClick={() => setTab(item.key)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-4 line-clamp-5 text-sm leading-7 text-slate-200/86">{text}</p>
    </GlassPanel>
  );
}
