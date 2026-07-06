"use client";

import { ScrollText } from "lucide-react";
import type { Stamp } from "@/types/domain";
import { cn } from "@/lib/utils";

export function StampSeal({ stamp, locked = false, className }: { stamp: Stamp; locked?: boolean; className?: string }) {
  const shortName = stamp.spot_name ?? stamp.name.replace(" 御朱印", "");

  return (
    <div
      className={cn(
        "relative aspect-[4/5] overflow-hidden rounded-[8px] border bg-[#f7efe2] p-4 shadow-[0_0_26px_rgba(168,85,247,0.16)]",
        locked ? "border-slate-600/40 grayscale" : "border-red-900/35",
        className,
      )}
    >
      <div className="absolute inset-2 border border-red-900/15" />
      <div className="absolute -right-8 top-8 h-28 w-28 rotate-12 rounded-full border-[12px] border-red-700/25" />
      <div className="absolute left-3 top-3 grid h-14 w-14 place-items-center rounded-full border-4 border-red-700/55 text-red-800">
        <ScrollText className="h-6 w-6" />
      </div>
      <div className="absolute bottom-4 right-4 h-20 w-20 rounded-[8px] border-[6px] border-red-700/60 opacity-75" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="font-serif text-sm tracking-[0.28em] text-red-800/80">奉拝</p>
        <p className="writing-vertical font-serif text-4xl font-black leading-none text-slate-950">{locked ? "未授与" : shortName}</p>
        <p className="text-xs text-red-900/70">{locked ? "LOCKED" : stamp.region}</p>
      </div>
      {locked ? <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]" /> : null}
    </div>
  );
}
