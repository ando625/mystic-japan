"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Gem } from "lucide-react";
import { getCollection, getSpots } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { completionRate } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { SpotCard } from "@/components/spot/SpotCard";

export default function CollectionPage() {
  const { token } = useAuthStore();
  const { data: spots = [] } = useQuery({
    queryKey: ["spots", token],
    queryFn: () => getSpots(token),
  });
  const { data: collection } = useQuery({
    queryKey: ["collection", token],
    queryFn: () => getCollection(token),
  });

  const summary = collection?.summary ?? {
    unlocked_count: spots.filter((spot) => spot.is_unlocked).length,
    total_spots: spots.length,
    completion_rate: completionRate(spots.filter((spot) => spot.is_unlocked).length, spots.length),
    mystic_points: 0,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <PageHeader title="図鑑コレクション" subtitle="解放した神域が増えるほど、失われた記憶が星図のようにつながります。" />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <GlassPanel glow className="p-5">
          <p className="text-sm text-cyan-100/70">発見率</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-semibold text-white text-glow">{summary.completion_rate}</span>
            <span className="pb-2 text-lg text-violet-100">%</span>
          </div>
        </GlassPanel>
        <GlassPanel className="p-5">
          <BookOpen className="h-6 w-6 text-cyan-100" />
          <p className="mt-4 text-sm text-slate-300">解放スポット</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary.unlocked_count} / {summary.total_spots}
          </p>
        </GlassPanel>
        <GlassPanel className="p-5">
          <Gem className="h-6 w-6 text-violet-100" />
          <p className="mt-4 text-sm text-slate-300">神秘ポイント</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary.mystic_points} pt</p>
        </GlassPanel>
      </section>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {spots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>
    </main>
  );
}
