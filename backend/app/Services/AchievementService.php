<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\Spot;
use App\Models\User;
use Illuminate\Support\Collection as SupportCollection;

class AchievementService
{
    /**
     * Grant every achievement that became true after a spot unlock.
     *
     * @return SupportCollection<int, Achievement>
     */
    public function grantUnlockedAchievements(User $user): SupportCollection
    {
        $newAchievements = collect();

        Achievement::query()->each(function (Achievement $achievement) use ($user, $newAchievements): void {
            // すでに獲得済みの称号は再付与しません。
            if ($user->achievements()->whereKey($achievement->id)->exists()) {
                return;
            }

            // 条件ごとに現在値を計算し、目標値に届いた時だけ付与します。
            $progress = $this->progressFor($user, $achievement);

            if ($progress['current'] < $progress['target']) {
                return;
            }

            $user->achievements()->attach($achievement->id, [
                'earned_at' => now(),
            ]);

            $newAchievements->push($achievement);
        });

        return $newAchievements;
    }

    /**
     * @return array{current: int, target: int}
     */
    public function progressFor(User $user, Achievement $achievement): array
    {
        $target = $achievement->condition_value;

        // condition_typeを使って、解放数・カテゴリ解放数・達成率などを切り替えます。
        $current = match ($achievement->condition_type) {
            Achievement::CONDITION_UNLOCK_COUNT => $user->collections()->count(),
            Achievement::CONDITION_CATEGORY_UNLOCK_COUNT => $this->categoryUnlockCount($user, $achievement),
            Achievement::CONDITION_COMPLETION_RATE => $this->completionRate($user),
            Achievement::CONDITION_MYSTIC_POINTS_TOTAL => $this->mysticPointsTotal($user),
            default => 0,
        };

        return [
            'current' => min($current, $target),
            'target' => $target,
        ];
    }

    public function mysticPointsTotal(User $user): int
    {
        return (int) $user->collections()
            ->join('spots', 'collections.spot_id', '=', 'spots.id')
            ->sum('spots.mystic_points');
    }

    public function completionRate(User $user): int
    {
        $totalSpots = Spot::query()->count();

        if ($totalSpots === 0) {
            // スポットが存在しない状態でもゼロ除算しないようにします。
            return 0;
        }

        return (int) floor(($user->collections()->count() / $totalSpots) * 100);
    }

    private function categoryUnlockCount(User $user, Achievement $achievement): int
    {
        return $user->collections()
            ->join('spots', 'collections.spot_id', '=', 'spots.id')
            ->where('spots.category', $achievement->condition_category)
            ->count();
    }
}
