import type { Stamp, UserProgress } from "@/types/domain";

export type JsonApiResponse<T> = {
  data: T;
};

export type UnlockSpotResponse = {
  collection: { spot_id: number; unlocked_at: string };
  user_progress?: UserProgress;
  gained_points: number;
  new_achievements: Array<{ id: number; title: string }>;
  already_unlocked: boolean;
};

export type VisitSpotResponse = {
  spot_id: number;
  visited_at: string;
  stamp_obtained: boolean;
  stamp?: Stamp | null;
  user_progress?: UserProgress;
};

export type RetrySpotQuizzesResponse = {
  can_retry: boolean;
  deleted_answers: number;
  correct_answers_count: number;
  required_correct_answers: number;
  answered_quiz_ids: number[];
};
