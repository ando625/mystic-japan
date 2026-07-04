<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\Spot;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    /**
     * Seed unlockable achievements.
     */
    public function run(): void
    {
        foreach ($this->achievements() as $achievement) {
            Achievement::query()->updateOrCreate(['title' => $achievement['title']], $achievement);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function achievements(): array
    {
        return [
            [
                'title' => '鳥居の導き手',
                'description' => '神社・仏閣スポットを3か所解放する',
                'condition_type' => Achievement::CONDITION_CATEGORY_UNLOCK_COUNT,
                'condition_value' => 3,
                'condition_category' => Spot::CATEGORY_SHRINE_TEMPLE,
                'icon_name' => 'Badge',
                'reward_points' => 50,
            ],
            [
                'title' => '神話探究者',
                'description' => '神話にまつわるスポットを5か所解放する',
                'condition_type' => Achievement::CONDITION_UNLOCK_COUNT,
                'condition_value' => 5,
                'condition_category' => null,
                'icon_name' => 'Sparkles',
                'reward_points' => 100,
            ],
            [
                'title' => '古代の旅人',
                'description' => '図鑑を50%以上達成する',
                'condition_type' => Achievement::CONDITION_COMPLETION_RATE,
                'condition_value' => 50,
                'condition_category' => null,
                'icon_name' => 'Compass',
                'reward_points' => 150,
            ],
            [
                'title' => '神秘の蒐集家',
                'description' => '神秘ポイントを850pt集める',
                'condition_type' => Achievement::CONDITION_MYSTIC_POINTS_TOTAL,
                'condition_value' => 850,
                'condition_category' => null,
                'icon_name' => 'Gem',
                'reward_points' => 200,
            ],
        ];
    }
}
