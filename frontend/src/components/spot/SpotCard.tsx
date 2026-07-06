"use client";

import { motion } from "framer-motion";
import { Gem, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { categoryLabel } from "@/data/categories";
import type { Spot } from "@/types/domain";
import { GlassPanel } from "@/components/ui/GlassPanel";
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
          <div className={compact ? "relative aspect-[4/3]" : "relative aspect-[5/4]"}>
            <SpotImage alt={spot.name} src={spot.image_url} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/8 to-transparent" />
            {!spot.is_unlocked ? (
              <div className="absolute inset-0 bg-slate-950/28" />
            ) : null}
            <div className="absolute right-3 top-3 rounded-full border border-violet-300/30 bg-slate-950/60 p-2 text-violet-100 backdrop-blur-md">
              {spot.is_unlocked ? <Gem className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[11px] text-cyan-100/75">{spot.region}</p>
              <h2 className="mt-1 truncate text-base font-semibold text-white text-glow">{spot.name}</h2>
              <p className="mt-1 truncate text-[11px] text-violet-100/80">{categoryLabel[spot.category]}</p>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </Link>
  );
}
