"use client";

import { BookOpen, Map, ScrollText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { GlowLink } from "@/components/ui/GlowButton";
import { AnimatedSpotImage } from "@/components/spot/AnimatedSpotImage";

export default function Home() {
  return (
    <main className="relative isolate -mb-24 min-h-screen overflow-hidden px-4 py-8 md:px-8 lg:py-10">
      <div className="absolute inset-0 -z-10">
        <AnimatedSpotImage alt="日本神秘紀行の幻想世界" priority src="/images/home/home.png" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,22,0.74),rgba(5,8,22,0.36)_46%,rgba(5,8,22,0.72)),linear-gradient(180deg,rgba(5,8,22,0.08),rgba(5,8,22,0.74)_70%,rgba(5,8,22,0.96))]" />
      </div>
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl content-center gap-8 pb-28 pt-10 lg:grid-cols-[1fr_0.58fr]"
      >
        <div>
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

        <div className="self-end rounded-[8px] border border-violet-300/18 bg-slate-950/28 p-5 backdrop-blur-md md:p-6">
          <p className="text-xs uppercase tracking-[0.36em] text-cyan-100/70">Gate of Memories</p>
          <h2 className="mt-2 text-3xl font-semibold text-white text-glow md:text-4xl">神域への扉</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-100/78">
            ここは旅の入口。地図、御朱印、神話クイズを通じて、日本各地に眠る記憶を解放していきます。
          </p>
        </div>
      </motion.section>

      <section className="mx-auto -mt-24 grid w-full max-w-7xl gap-4 pb-32 md:grid-cols-3">
        {[
          { title: "地図から巡る", body: "日本地図上の神域を選び、解放条件や物語を確認します。", icon: Map, href: "/map" },
          { title: "御朱印を集める", body: "訪問やクイズ正解で、幻想御朱印が御朱印帳に刻まれます。", icon: ScrollText, href: "/stamps" },
          { title: "神話を解く", body: "神話・歴史を読んでクイズへ。正解で神力ポイントが増えます。", icon: Sparkles, href: "/spots" },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              className="rounded-[8px] border border-violet-300/18 bg-slate-950/38 p-5 backdrop-blur-xl transition hover:border-violet-200/45 hover:bg-violet-500/12"
              whileHover={{ y: -4 }}
            >
              <div className="mb-4 inline-flex rounded-full border border-violet-300/30 bg-violet-500/15 p-3 text-violet-100">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 min-h-16 text-sm leading-6 text-slate-300">{item.body}</p>
              <GlowLink className="mt-4 w-full bg-slate-950/35" href={item.href}>
                <BookOpen className="h-4 w-4" />
                開く
              </GlowLink>
            </motion.div>
          );
        })}
      </section>
    </main>
  );
}
