"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { categories } from "@/data/categories";
import { getSpots } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useProgressStore } from "@/stores/progress-store";
import type { SpotCategory } from "@/types/domain";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { SpotCard } from "@/components/spot/SpotCard";

// 図鑑一覧画面: スポットをカテゴリで絞り込み、解放済み/未解放の状態をカードに表示します。
export default function SpotsPage() {
  const [category, setCategory] = useState<SpotCategory | "all">("all");
  const { token } = useAuthStore();
  const syncFromSpots = useProgressStore((state) => state.syncFromSpots);
  // 一覧APIの結果をZustandにも同期し、他画面の進行表示とずれないようにします。
  const { data: spots = [] } = useQuery({
    queryKey: ["spots", token],
    queryFn: () => getSpots(token),
  });

  useEffect(() => {
    syncFromSpots(spots);
  }, [spots, syncFromSpots]);

  const filtered = useMemo(
    // カテゴリボタンで表示するスポットだけを切り替えます。
    () => (category === "all" ? spots : spots.filter((spot) => spot.category === category)),
    [category, spots],
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <PageHeader title="絶景コレクション" subtitle="神話、自然、海、森。解放するほど図鑑が光を取り戻します。" />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => (
          <button
            key={item.value}
            className={cn(
              "min-h-10 shrink-0 rounded-[8px] border border-violet-300/20 bg-slate-950/45 px-4 text-sm text-slate-200 transition hover:border-violet-200/50 hover:bg-violet-500/20",
              category === item.value && "border-violet-200/70 bg-violet-500/32 text-white shadow-[0_0_24px_rgba(168,85,247,0.28)]",
            )}
            onClick={() => setCategory(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((spot) => (
          <SpotCard key={spot.id} compact spot={spot} />
        ))}
      </div>
    </main>
  );
}
