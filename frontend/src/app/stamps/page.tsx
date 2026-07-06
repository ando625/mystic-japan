"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LockKeyhole, ScrollText } from "lucide-react";
import Link from "next/link";
import { getStamps } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useProgressStore } from "@/stores/progress-store";
import { StampSeal } from "@/components/stamp/StampSeal";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { RarityStars } from "@/components/ui/RarityStars";

export default function StampsPage() {
  const { token } = useAuthStore();
  const syncFromStamps = useProgressStore((state) => state.syncFromStamps);
  const { data: stamps = [] } = useQuery({
    queryKey: ["stamps", token],
    queryFn: () => getStamps(token),
  });

  useEffect(() => {
    syncFromStamps(stamps);
  }, [stamps, syncFromStamps]);

  const obtainedCount = stamps.filter((stamp) => stamp.is_obtained).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <PageHeader
        title="御朱印帳"
        subtitle="神域を訪問し、神話クイズに正解して、旅の証を集めます。"
        action={
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-violet-300/25 bg-slate-950/55 px-4 py-3 text-sm text-violet-100">
            <ScrollText className="h-4 w-4" />
            {obtainedCount} / {stamps.length}
          </div>
        }
      />
      {!token ? (
        <GlassPanel className="mb-6 p-5">
          <p className="text-sm leading-6 text-slate-300">ログインすると御朱印の獲得状況が保存されます。</p>
          <Link className="mt-4 inline-flex text-sm font-semibold text-violet-100" href="/login">
            旅人としてログイン
          </Link>
        </GlassPanel>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stamps.map((stamp) => (
          <GlassPanel key={stamp.id} glow={stamp.is_obtained} className="overflow-hidden p-3">
            <StampSeal stamp={stamp} locked={!stamp.is_obtained} />
            <div className="p-2">
              <div className="mt-2 flex items-center justify-between gap-3">
                <h2 className="truncate text-base font-semibold text-white">{stamp.name}</h2>
                {!stamp.is_obtained ? <LockKeyhole className="h-4 w-4 shrink-0 text-violet-100" /> : null}
              </div>
              <p className="mt-1 text-xs text-cyan-100/75">{stamp.region}</p>
              <div className="mt-2">
                <RarityStars value={stamp.rarity} />
              </div>
              <p className="mt-3 min-h-12 text-xs leading-5 text-slate-300">{stamp.description}</p>
              <p className="mt-3 text-xs text-violet-100/80">
                {stamp.is_obtained && stamp.obtained_at ? `獲得日時: ${new Date(stamp.obtained_at).toLocaleString("ja-JP")}` : "未獲得"}
              </p>
            </div>
          </GlassPanel>
        ))}
      </div>
    </main>
  );
}
