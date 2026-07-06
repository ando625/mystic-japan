"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { defaultImage } from "@/data/fallback-spots";
import type { Spot } from "@/types/domain";

export function CinematicSpotModal({
  open,
  spot,
  imageSrc: selectedImageSrc,
  onClose,
}: {
  open: boolean;
  spot: Spot;
  imageSrc?: string | null;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(true);
  const [imageSrc, setImageSrc] = useState(selectedImageSrc || spot.image_url || defaultImage);

  useEffect(() => {
    setImageSrc(selectedImageSrc || spot.image_url || defaultImage);
  }, [selectedImageSrc, spot.image_url]);

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
          className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-md"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
          >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative h-full w-full overflow-hidden bg-slate-950"
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
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(5,8,22,0.22)_76%),linear-gradient(180deg,rgba(5,8,22,0.04),rgba(5,8,22,0.3))]" />

            <button
              aria-label="閉じる"
              className="absolute right-5 top-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-violet-200/30 bg-slate-950/58 text-slate-200 backdrop-blur-md transition hover:border-violet-100/70 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              className="absolute bottom-5 right-5 z-20 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-violet-200/30 bg-slate-950/58 px-4 text-sm text-white backdrop-blur-md transition hover:bg-violet-400/22"
              onClick={() => setPlaying((value) => !value)}
              type="button"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "演出停止" : "演出再開"}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
