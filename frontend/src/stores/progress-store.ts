"use client";

import { create } from "zustand";
import type { QuizAnswerResult, Stamp } from "@/types/domain";

// ユーザーの進行状況をフロント側で一時的に共有するZustand storeです。
// 正式な保存先はLaravel/PostgreSQLなので、ここは画面即時更新のための補助として使います。
type ProgressState = {
  // 解放済みスポットID一覧です。スポット一覧や図鑑の表示補助に使います。
  unlockedSpotIds: number[];
  // 獲得済み御朱印ID一覧です。御朱印帳や詳細画面の表示補助に使います。
  obtainedStampIds: number[];
  // 回答済みクイズID一覧です。クイズ画面のボタン制御に使います。
  answeredQuizIds: number[];
  // ユーザーの合計神秘ポイントです。APIから返る値で上書きします。
  totalPoints: number;
  // スポット一覧APIの結果から解放済みIDを同期します。
  syncFromSpots: (spots: Array<{ id: number; is_unlocked: boolean }>) => void;
  // 御朱印APIの結果から獲得済みIDを同期します。
  syncFromStamps: (stamps: Stamp[]) => void;
  // クイズ回答APIの結果を反映し、回答済み・御朱印・ポイントを更新します。
  applyQuizResult: (result: QuizAnswerResult) => void;
  // 互換用の手動解放APIなどでスポット解放を反映する関数です。
  markSpotUnlocked: (spotId: number, points?: number) => void;
};

function unique(values: number[]) {
  // 同じIDを複数回入れないようにSetで重複を消します。
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
