export type SpotCategory =
  | "shrine_temple"
  | "nature"
  | "sea_lake"
  | "myth"
  | "forest_mountain"
  | "other";

// Laravelのspots APIから返る、スポット詳細の中心データです。
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
  // trueなら新規ユーザー登録/ログイン時に最初から解放されます。
  is_initially_unlocked?: boolean;
  // ログインユーザーにとって解放済みかどうかです。
  is_unlocked: boolean;
  unlocked_at?: string | null;
  visited_at?: string | null;
  unlock_condition?: string;
  stamp?: Stamp | null;
  // 御朱印を獲得済みかどうかです。stamp.is_obtainedと同じ意味で使う場面があります。
  stamp_obtained?: boolean;
  obtained_at?: string | null;
  total_points?: number;
  answered_quiz_ids?: number[];
  user_progress?: UserProgress | null;
};

// 詳細画面のメインビューアで扱う、画像または動画の共通型です。
export type SpotMedia = {
  id: number | string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string | null;
  alt?: string | null;
  objectPosition?: string | null;
};

// APIレスポンスに含める、ログインユーザーごとのスポット進行状態です。
export type UserProgress = {
  is_unlocked: boolean;
  unlocked_at?: string | null;
  visited_at?: string | null;
  stamp_obtained?: boolean;
  total_points?: number;
  answered_quiz_ids?: number[];
};

// 御朱印帳・スポット詳細で使う御朱印データです。
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

// クイズ画面で表示する1問分のデータです。
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

// クイズ回答APIのレスポンスです。正誤だけでなく、報酬や御朱印獲得状態も返ります。
export type QuizAnswerResult = {
  quiz_id: number;
  selected_option: QuizOption;
  correct_option: QuizOption;
  is_correct: boolean;
  already_answered: boolean;
  reward_points: number;
  explanation: string;
  stamp_obtained: boolean;
  stamp_newly_obtained?: boolean;
  stamp?: Stamp | null;
  spot_unlocked: boolean;
  correct_answers_count?: number;
  required_correct_answers?: number;
  visited?: boolean;
  user_progress?: UserProgress;
};

// 称号一覧APIの1件分です。progressは現在値と目標値です。
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

// 図鑑コレクション画面の集計データです。
export type CollectionSummary = {
  unlocked_count: number;
  total_spots: number;
  completion_rate: number;
  mystic_points: number;
};

// ログインAPI/新規登録APIから返るユーザー情報です。
export type User = {
  id: number;
  name: string;
  email: string;
};
