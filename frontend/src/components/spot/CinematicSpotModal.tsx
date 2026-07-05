"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { defaultImage } from "@/data/fallback-spots";
import type { Spot } from "@/types/domain";
import { RarityStars } from "@/components/ui/RarityStars";

export function CinematicSpotModal({
  open,
  spot,
  onClose,
}: {
  open: boolean;
  spot: Spot;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(true);
  const [imageSrc, setImageSrc] = useState(spot.image_url || defaultImage);

  useEffect(() => {
    setImageSrc(spot.image_url || defaultImage);
  }, [spot.image_url]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/88 p-4 backdrop-blur-md"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative h-[min(82vh,48rem)] w-full max-w-6xl overflow-hidden rounded-[8px] border border-cyan-100/20 bg-slate-950 shadow-[0_0_90px_rgba(56,189,248,0.2)]"
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            initial={{ opacity: 0, scale: 0.94, y: 22 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={
                playing
                  ? {
                      scale: [1.02, 1.14, 1.06],
                      x: ["0%", "-2.8%", "2.2%", "0%"],
                      y: ["0%", "-2%", "1.8%", "0%"],
                    }
                  : {}
              }
              className="absolute inset-0"
              transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
            >
              <Image
                alt={`${spot.name} 幻想鑑賞`}
                className="object-cover"
                fill
                onError={() => setImageSrc(defaultImage)}
                priority
                sizes="100vw"
                src={imageSrc}
                unoptimized
              />
            </motion.div>

            <motion.div
              animate={playing ? { opacity: [0.22, 0.5, 0.28], x: ["-8%", "8%", "-8%"] } : {}}
              className="pointer-events-none absolute left-[-20%] top-1/4 h-44 w-[140%] rotate-[-12deg] bg-[linear-gradient(90deg,transparent,rgba(56,189,248,0.34),rgba(168,85,247,0.32),transparent)] blur-3xl"
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="pointer-events-none absolute inset-0 stars-layer opacity-50" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_26%,rgba(5,8,22,0.34)_70%),linear-gradient(180deg,rgba(5,8,22,0.16),rgba(5,8,22,0.88))]" />

            <button
              aria-label="閉じる"
              className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-violet-200/30 bg-slate-950/70 text-slate-200 transition hover:border-violet-100/70 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-8">
              <div className="max-w-3xl">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-cyan-100/80">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.32em]">Mystic Viewing</span>
                </div>
                <h2 className="text-4xl font-semibold text-white text-glow md:text-6xl">{spot.name}</h2>
                <p className="mt-3 text-sm text-cyan-100/75">
                  {spot.region} / {spot.prefecture}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-100/82">{spot.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <RarityStars value={spot.rarity} />
                  <button
                    className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-violet-200/30 bg-violet-500/22 px-4 text-sm text-white transition hover:bg-violet-400/30"
                    onClick={() => setPlaying((value) => !value)}
                    type="button"
                  >
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {playing ? "演出を止める" : "演出を再開"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
