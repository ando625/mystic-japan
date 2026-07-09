"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Compass, Gem, Sparkles } from "lucide-react";
import { getAchievements } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PageHeader } from "@/components/ui/PageHeader";

const iconMap = {
  Badge,
  Compass,
  Gem,
  Sparkles,
};

// 称号画面: 解放数や御朱印数などの進行に応じた達成状況を表示します。
export default function AchievementsPage() {
  const { token } = useAuthStore();
  // Laravel側で現在の進行度を計算した称号一覧を取得します。
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements", token],
    queryFn: () => getAchievements(token),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <PageHeader title="称号一覧" subtitle="旅の進行に応じて、神々の記憶が称号として刻まれます。" />
      <div className="grid gap-4">
        {achievements.map((achievement) => {
          const Icon = iconMap[achievement.icon_name as keyof typeof iconMap] ?? Sparkles;
          const percent = Math.min(100, Math.round((achievement.progress.current / achievement.progress.target) * 100));

          return (
            <GlassPanel key={achievement.id} glow={achievement.is_earned} className="p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-violet-200/35 bg-violet-500/16 text-violet-100">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">{achievement.title}</h2>
                    <span className="rounded-full border border-cyan-200/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                      {achievement.is_earned ? "達成済み" : "進行中"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{achievement.description}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-violet-300 shadow-[0_0_18px_rgba(168,85,247,0.75)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
                <div className="text-right text-sm text-violet-100">
                  <p className="text-2xl font-semibold text-white">
                    {achievement.progress.current} / {achievement.progress.target}
                  </p>
                  <p className="mt-1">+{achievement.reward_points} pt</p>
                </div>
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </main>
  );
}
