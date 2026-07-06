"use client";

import { BookOpen, Map } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const homeHeroImage = "/images/home/home.png";

export default function Home() {
  return (
    <main className="relative isolate -mb-24 h-screen min-h-screen w-full overflow-hidden bg-[#03030b]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,#160b2e_0%,#070512_45%,#020208_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-25 blur-[72px]">
        <Image
          alt=""
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={homeHeroImage}
          unoptimized
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(34,21,72,0.08),rgba(3,3,11,0.84)_64%,rgba(2,2,8,0.98)_100%)]" />

      <div className="absolute inset-y-0 left-1/2 z-0 w-full max-w-[min(76vw,760px)] -translate-x-1/2 sm:max-w-[min(64vw,760px)]">
        <motion.div
          animate={{ scale: [1, 1.025], y: [0, -8, 0] }}
          className="absolute inset-0"
          transition={{
            duration: 26,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Image
            alt="日本神秘紀行の幻想的な絶景"
            className="object-contain"
            fill
            priority
            sizes="100vw"
            src={homeHeroImage}
            unoptimized
          />
        </motion.div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(2,2,8,0.86),rgba(2,2,8,0.18)_24%,transparent_40%,transparent_60%,rgba(2,2,8,0.2)_76%,rgba(2,2,8,0.88))]" />

      <motion.section
        animate={{ opacity: 0.84, x: 0 }}
        className="relative z-10 flex h-screen w-full items-start px-5 pb-28 pt-16 md:items-center md:px-8 lg:px-10"
        initial={{ opacity: 0, x: -15 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-[18rem] md:max-w-[22rem]">
          <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-cyan-100/65 md:text-xs">
            Mystic Japan
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white/88 drop-shadow-[0_0_12px_rgba(255,255,255,0.22)] md:text-4xl lg:text-5xl">
            日本神秘紀行
          </h1>
          <p className="mt-3 text-sm text-violet-50/76 md:text-base">
            神々の記憶を巡る旅
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[8px] border border-white/10 bg-black/20 px-3 text-sm font-medium text-white/75 opacity-80 backdrop-blur-sm transition hover:border-white/25 hover:bg-white/12 hover:text-white hover:opacity-100"
              href="/map"
            >
              <Map className="h-3.5 w-3.5" />
              旅を始める
            </Link>
            <Link
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[8px] border border-white/10 bg-black/20 px-3 text-sm font-medium text-white/75 opacity-80 backdrop-blur-sm transition hover:border-white/25 hover:bg-white/12 hover:text-white hover:opacity-100"
              href="/spots"
            >
              <BookOpen className="h-3.5 w-3.5" />
              図鑑を見る
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
