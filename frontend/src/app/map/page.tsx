"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Compass } from "lucide-react";
import { getSpots } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { SpotCard } from "@/components/spot/SpotCard";

const MapView = dynamic(() => import("@/components/map/MysticMap").then((mod) => mod.MysticMap), {
  ssr: false,
  loading: () => <div className="grid min-h-[620px] place-items-center text-slate-300">地図を展開中...</div>,
});

export default function MapPage() {
  const { token } = useAuthStore();
  const { data: spots = [] } = useQuery({
    queryKey: ["spots", token],
    queryFn: () => getSpots(token),
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <PageHeader
        title="日本の絶景MAP"
        subtitle="紫の光を帯びたピンから神域を選び、スポット詳細へ進みます。"
        action={
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-cyan-200/20 bg-slate-950/45 px-4 py-3 text-sm text-cyan-100">
            <Compass className="h-4 w-4" />
            {spots.length} spots
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <GlassPanel glow className="overflow-hidden">
          <MapView spots={spots} />
        </GlassPanel>
        <div className="grid max-h-[680px] gap-4 overflow-y-auto pr-1">
          {spots.slice(0, 5).map((spot) => (
            <SpotCard key={spot.id} compact spot={spot} />
          ))}
        </div>
      </div>
    </main>
  );
}
