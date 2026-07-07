"use client";

import { create } from "zustand";
import type { QuizAnswerResult, Stamp } from "@/types/domain";

type ProgressState = {
  unlockedSpotIds: number[];
  obtainedStampIds: number[];
  answeredQuizIds: number[];
  totalPoints: number;
  syncFromSpots: (spots: Array<{ id: number; is_unlocked: boolean }>) => void;
  syncFromStamps: (stamps: Stamp[]) => void;
  applyQuizResult: (result: QuizAnswerResult) => void;
  markSpotUnlocked: (spotId: number, points?: number) => void;
};

function unique(values: number[]) {
  return Array.from(new Set(values));
}

export const useProgressStore = create<ProgressState>((set) => ({
  unlockedSpotIds: [],
  obtainedStampIds: [],
  answeredQuizIds: [],
  totalPoints: 0,
  syncFromSpots: (spots) =>
    set({
      unlockedSpotIds: spots.filter((spot) => spot.is_unlocked).map((spot) => spot.id),
    }),
  syncFromStamps: (stamps) =>
    set({
      obtainedStampIds: stamps.filter((stamp) => stamp.is_obtained).map((stamp) => stamp.id),
    }),
  applyQuizResult: (result) =>
    set((state) => ({
      answeredQuizIds: unique([...state.answeredQuizIds, result.quiz_id]),
      obtainedStampIds: result.stamp ? unique([...state.obtainedStampIds, result.stamp.id]) : state.obtainedStampIds,
      totalPoints: result.user_progress?.total_points ?? state.totalPoints + result.reward_points,
    })),
  markSpotUnlocked: (spotId, points = 0) =>
    set((state) => ({
      unlockedSpotIds: unique([...state.unlockedSpotIds, spotId]),
      totalPoints: state.totalPoints + points,
    })),
}));
