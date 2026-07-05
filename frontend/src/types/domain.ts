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
  music_url?: string | null;
  video_url?: string | null;
  rarity: number;
  mystic_points: number;
  is_unlocked: boolean;
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
