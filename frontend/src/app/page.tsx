"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Map, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getSpots } from "@/lib/api";
import { GlowLink } from "@/components/ui/GlowButton";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SpotCard } from "@/components/spot/SpotCard";
import { SpotImage } from "@/components/spot/SpotImage";

export default function Home() {
  const { data: spots = [] } = useQuery({
    queryKey: ["spots"],
    queryFn: () => getSpots(),
  });
  const featured = spots.slice(0, 4);
  const heroSpot = spots[0];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 md:px-8 lg:py-10">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="grid flex-1 items-center gap-8 lg:grid-cols-[1.04fr_0.96fr]"
      >
        <div className="pt-8 md:pt-16">
          <p className="mb-4 text-sm uppercase tracking-[0.38em] text-cyan-100/70">Mystic Japan</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white text-glow md:text-7xl">
            日本神秘紀行
          </h1>
          <p className="mt-4 text-xl text-violet-100/90 md:text-2xl">神々の記憶を巡る旅</p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200/78">
            日本地図から神域を解放し、神話・歴史・絶景・BGMを集めていく幻想図鑑。
            旅は観光ではなく、記憶を取り戻す探索です。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GlowLink href="/map">
              <Map className="h-4 w-4" />
              旅を始める
            </GlowLink>
            <GlowLink href="/spots" className="bg-slate-950/35">
              <BookOpen className="h-4 w-4" />
              図鑑を見る
            </GlowLink>
          </div>
        </div>

        {heroSpot ? (
          <GlassPanel glow className="overflow-hidden">
            <div className="relative aspect-[4/3]">
              <SpotImage alt={heroSpot.name} src={heroSpot.image_url} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/8 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-sm text-cyan-100/75">{heroSpot.region}</p>
                <h2 className="mt-1 text-3xl font-semibold text-white text-glow">{heroSpot.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200/80">{heroSpot.description}</p>
              </div>
            </div>
          </GlassPanel>
        ) : null}
      </motion.section>

      <section className="mt-10 grid gap-4 lg:grid-cols-[0.74fr_0.26fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((spot) => (
            <SpotCard key={spot.id} compact spot={spot} />
          ))}
        </div>
        <GlassPanel className="flex flex-col justify-between p-5">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-violet-300/30 bg-violet-500/15 p-3 text-violet-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">神秘ポイント</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              スポットを解放するとポイントと称号が進行します。Phase3ではUI基盤、解放API連携は詳細画面から確認できます。
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3 text-violet-100">
            <Play className="h-5 w-5" />
            <span className="text-sm">BGM UI ready</span>
          </div>
        </GlassPanel>
      </section>
    </main>
  );
}
