"use client";

import { BookOpen, Map } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const homeHeroImage = "/images/home/home.png";

export default function Home() {
  return (
    <main className="relative isolate -mb-24 min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ scale: [1.05, 1.12] }}
          className="absolute inset-0"
          transition={{
            duration: 22,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Image
            alt="日本神秘紀行の幻想的な絶景"
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={homeHeroImage}
            unoptimized
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,18,0.76),rgba(30,16,64,0.38)_42%,rgba(3,7,18,0.28)_70%),linear-gradient(180deg,rgba(3,7,18,0.18),rgba(3,7,18,0.22)_46%,rgba(3,7,18,0.9))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,rgba(168,85,247,0.18),transparent_34%),radial-gradient(circle_at_76%_16%,rgba(56,189,248,0.12),transparent_32%)]" />
      </div>

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex min-h-screen w-full items-center px-5 pb-36 pt-20 md:px-10 lg:px-16"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-cyan-100/72 drop-shadow-[0_0_12px_rgba(103,232,249,0.45)] md:text-sm">
            Mystic Japan
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-white drop-shadow-[0_0_28px_rgba(216,180,254,0.52)] md:text-7xl lg:text-8xl">
            日本神秘紀行
          </h1>
          <p className="mt-5 text-xl text-violet-50/90 drop-shadow-[0_0_18px_rgba(255,255,255,0.28)] md:text-3xl">
            神々の記憶を巡る旅
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-5 text-sm font-medium text-white shadow-[0_0_24px_rgba(15,23,42,0.28)] backdrop-blur-md transition hover:border-white/35 hover:bg-white/18"
              href="/map"
            >
              <Map className="h-4 w-4" />
              旅を始める
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-5 text-sm font-medium text-white shadow-[0_0_24px_rgba(15,23,42,0.28)] backdrop-blur-md transition hover:border-white/35 hover:bg-white/18"
              href="/spots"
            >
              <BookOpen className="h-4 w-4" />
              図鑑を見る
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
