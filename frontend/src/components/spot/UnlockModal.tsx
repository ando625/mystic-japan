"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Gem, Sparkles, X } from "lucide-react";
import { useEffect } from "react";

type UnlockModalProps = {
  open: boolean;
  spotName: string;
  points: number;
  achievements: Array<{ id: number; title: string }>;
  onClose: () => void;
};

export function UnlockModal({ open, spotName, points, achievements, onClose }: UnlockModalProps) {
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
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/78 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-[8px] border border-violet-200/35 bg-slate-950/88 p-6 text-center shadow-[0_0_80px_rgba(168,85,247,0.45)]"
            initial={{ opacity: 0, scale: 0.82, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.24),transparent_58%)]" />
            <button
              aria-label="閉じる"
              className="absolute right-4 top-4 z-20 rounded-full border border-violet-300/20 bg-slate-950/70 p-2 text-slate-300 transition hover:border-violet-200/60 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
            <motion.div
              className="relative mx-auto mb-6 grid h-28 w-28 place-items-center"
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 rounded-full border border-violet-200/30 shadow-[0_0_52px_rgba(168,85,247,0.72)]" />
              <div className="absolute h-20 w-20 rotate-45 border border-cyan-100/35 bg-violet-400/16 shadow-[0_0_36px_rgba(125,211,252,0.42)]" />
              <Gem className="relative h-12 w-12 text-violet-100" />
            </motion.div>
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-100/70">Unlocked</p>
              <h2 className="mt-3 text-3xl font-semibold text-white text-glow">新たな絶景を解放しました</h2>
              <p className="mt-3 text-xl text-violet-100">{spotName}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-[8px] border border-violet-200/30 bg-violet-500/18 px-5 py-3 text-lg font-semibold text-white">
                <Sparkles className="h-5 w-5 text-cyan-100" />
                神秘ポイント +{points}
              </div>
              {achievements.length > 0 ? (
                <div className="mt-5 space-y-2 text-sm text-cyan-100">
                  {achievements.map((achievement) => (
                    <p key={achievement.id}>称号獲得: {achievement.title}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
