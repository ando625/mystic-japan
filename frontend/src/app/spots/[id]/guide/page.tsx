"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AiGuideChat } from "@/components/spot/AiGuideChat";
import { SpotImage } from "@/components/spot/SpotImage";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSpot } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function AiGuidePage() {
  const params = useParams<{ id: string }>();
  const spotId = Number(params.id);
  const { token } = useAuthStore();

  const { data: spot, isLoading } = useQuery({
    queryKey: ["spot", spotId, token],
    queryFn: () => getSpot(spotId, token),
    enabled: Number.isFinite(spotId),
  });

  if (isLoading || !spot) {
    return <main className="grid min-h-screen place-items-center text-slate-300">AI旅ガイドを起動中...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <Link className="mb-5 inline-flex items-center gap-2 text-sm text-cyan-100/80 hover:text-white" href={`/spots/${spot.id}`}>
        <ArrowLeft className="h-4 w-4" />
        {spot.name}へ戻る
      </Link>
      <PageHeader title="AI旅ガイド" subtitle={`${spot.name}の神話・歴史・豆知識をもとに、幻想案内人が答えます。`} />
      <section className="grid gap-5 lg:grid-cols-[0.42fr_0.58fr]">
        <GlassPanel className="overflow-hidden">
          <div className="aspect-[4/5]">
            <SpotImage alt={spot.name} src={spot.image_url} />
          </div>
          <div className="p-5">
            <p className="text-sm text-cyan-100/70">{spot.prefecture}</p>
            <h1 className="mt-1 text-3xl font-semibold text-white text-glow">{spot.name}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">{spot.description}</p>
          </div>
        </GlassPanel>
        <AiGuideChat spot={spot} />
      </section>
    </main>
  );
}
