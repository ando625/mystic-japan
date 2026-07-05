"use client";

import { motion } from "framer-motion";
import { Gem, LockKeyhole, MapPin } from "lucide-react";
import Link from "next/link";
import { categoryLabel } from "@/data/categories";
import type { Spot } from "@/types/domain";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { RarityStars } from "@/components/ui/RarityStars";
import { SpotImage } from "@/components/spot/SpotImage";

export function SpotCard({ spot, compact = false }: { spot: Spot; compact?: boolean }) {
  return (
    <Link href={`/spots/${spot.id}`} className="group block">
      <motion.div
        layoutId={`spot-card-${spot.id}`}
        whileHover={{ y: -6, scale: 1.025 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <GlassPanel className="overflow-hidden transition duration-300 group-hover:border-violet-200/50 group-hover:shadow-[0_0_34px_rgba(168,85,247,0.34)]">
        <div className={compact ? "aspect-[4/3]" : "aspect-[16/10]"}>
          <SpotImage alt={spot.name} src={spot.image_url} />
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-cyan-100/70">{categoryLabel[spot.category]}</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{spot.name}</h2>
            </div>
            <div className="rounded-full border border-violet-300/30 bg-violet-500/15 p-2 text-violet-100">
              {spot.is_unlocked ? <Gem className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="h-4 w-4 text-cyan-200" />
            <span>{spot.prefecture}</span>
          </div>
          {!compact ? <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-200/76">{spot.description}</p> : null}
          <div className="flex items-center justify-between gap-2">
            <RarityStars value={spot.rarity} />
            <span className="text-sm font-medium text-violet-100">{spot.mystic_points} pt</span>
          </div>
        </div>
        </GlassPanel>
      </motion.div>
    </Link>
  );
}
