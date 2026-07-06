export type SpotCategory =
  | "shrine_temple"
  | "nature"
  | "sea_lake"
  | "myth"
  | "forest_mountain"
  | "other";

export type Spot = {
  id: number;
  name: string;
  region: string;
  prefecture: string;
  category: SpotCategory;
  description: string;
  mythology?: string;
  history?: string;
  trivia?: string;
  latitude: number;
  longitude: number;
  image_url?: string | null;
  images?: string[] | null;
  media?: SpotMedia[] | null;
  music_url?: string | null;
  video_url?: string | null;
  rarity: number;
  mystic_points: number;
  is_initially_unlocked?: boolean;
  is_unlocked: boolean;
  visited_at?: string | null;
  unlock_condition?: string;
  stamp?: Stamp | null;
  stamp_obtained?: boolean;
  obtained_at?: string | null;
  user_progress?: UserProgress | null;
};

export type SpotMedia = {
  id: number | string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string | null;
  alt?: string | null;
};

export type UserProgress = {
  is_unlocked: boolean;
  visited_at?: string | null;
  stamp_obtained?: boolean;
  total_points?: number;
};

export type Stamp = {
  id: number;
  spot_id: number;
  spot_name?: string | null;
  region?: string | null;
  name: string;
  description: string;
  image_path?: string | null;
  rarity: number;
  is_obtained: boolean;
  obtained_at?: string | null;
};

export type QuizOption = "A" | "B" | "C" | "D";

export type Quiz = {
  id: number;
  spot_id: number;
  question: string;
  options: Record<QuizOption, string>;
  explanation?: string;
  reward_points: number;
  answered_at?: string | null;
  selected_option?: QuizOption | null;
  is_correct?: boolean | null;
};

export type QuizAnswerResult = {
  quiz_id: number;
  selected_option: QuizOption;
  correct_option: QuizOption;
  is_correct: boolean;
  already_answered: boolean;
  reward_points: number;
  explanation: string;
  stamp_obtained: boolean;
  stamp?: Stamp | null;
  spot_unlocked: boolean;
  visited?: boolean;
  user_progress?: UserProgress;
};

export type Achievement = {
  id: number;
  title: string;
  description: string;
  condition_type: string;
  condition_value: number;
  condition_category?: SpotCategory | null;
  icon_name: string;
  reward_points: number;
  is_earned: boolean;
  earned_at?: string | null;
  progress: {
    current: number;
    target: number;
  };
};

export type CollectionSummary = {
  unlocked_count: number;
  total_spots: number;
  completion_rate: number;
  mystic_points: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
};
