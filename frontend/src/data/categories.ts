import type { SpotCategory } from "@/types/domain";

export const categories: Array<{ label: string; value: SpotCategory | "all" }> =
  [
    { label: "すべて", value: "all" },
    { label: "神社・仏閣", value: "shrine_temple" },
    { label: "自然", value: "nature" },
    { label: "海・湖", value: "sea_lake" },
    { label: "神話", value: "myth" },
    { label: "山・森", value: "forest_mountain" },
  ];

export const categoryLabel: Record<SpotCategory, string> = {
  shrine_temple: "神社・仏閣",
  nature: "自然",
  sea_lake: "海・湖",
  myth: "神話",
  forest_mountain: "山・森",
  other: "その他",
};
