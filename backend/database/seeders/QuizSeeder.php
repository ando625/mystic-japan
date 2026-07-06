<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\Spot;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        Spot::query()->orderBy('id')->each(function (Spot $spot): void {
            foreach ($this->quizzesFor($spot) as $quiz) {
                Quiz::query()->updateOrCreate(
                    [
                        'spot_id' => $spot->id,
                        'question' => $quiz['question'],
                    ],
                    $quiz,
                );
            }
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function quizzesFor(Spot $spot): array
    {
        return [
            [
                'spot_id' => $spot->id,
                'question' => "{$spot->name}が属する神秘エリアはどれ？",
                'option_a' => $spot->region,
                'option_b' => '異国の都',
                'option_c' => '未来都市',
                'option_d' => '砂漠の王国',
                'correct_option' => 'A',
                'explanation' => "{$spot->name}は「{$spot->region}」に分類されています。地図で同じ物語圏のスポットも探してみましょう。",
                'reward_points' => 25,
            ],
            [
                'spot_id' => $spot->id,
                'question' => "{$spot->name}の記憶として最も近いものは？",
                'option_a' => '地下鉄の路線図',
                'option_b' => $this->keywordFrom($spot),
                'option_c' => '近代ビル街',
                'option_d' => '海外の王城',
                'correct_option' => 'B',
                'explanation' => $spot->mythology ?: $spot->description,
                'reward_points' => 35,
            ],
        ];
    }

    private function keywordFrom(Spot $spot): string
    {
        return match ($spot->category) {
            Spot::CATEGORY_SHRINE_TEMPLE => '神社・信仰・神域にまつわる記憶',
            Spot::CATEGORY_SEA_LAKE => '水面・湖・海に宿る神秘',
            Spot::CATEGORY_FOREST_MOUNTAIN => '森や山に残る古い生命の記憶',
            Spot::CATEGORY_MYTH => '神話や伝承と結びついた物語',
            Spot::CATEGORY_NATURE => '自然景観そのものに宿る祈り',
            default => '土地に伝わる不思議な記憶',
        };
    }
}
