<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

// achievementsテーブルのModelです。
// 「解放数が何個以上」「神秘ポイントが何点以上」など、称号の条件マスタを表します。
class Achievement extends Model
{
    // condition_typeに入る値です。AchievementServiceでこの値を見て達成判定を分岐します。
    public const CONDITION_UNLOCK_COUNT = 'unlock_count';

    public const CONDITION_CATEGORY_UNLOCK_COUNT = 'category_unlock_count';

    public const CONDITION_COMPLETION_RATE = 'completion_rate';

    public const CONDITION_MYSTIC_POINTS_TOTAL = 'mystic_points_total';

    protected $fillable = [
        // create/updateで一括代入してよいカラムです。Seederから称号を登録する時に使います。
        'title',
        'description',
        'condition_type',
        'condition_value',
        'condition_category',
        'icon_name',
        'reward_points',
    ];

    protected function casts(): array
    {
        return [
            // DBでは数値でも文字列として返る場合があるため、PHP側ではintegerとして扱います。
            'condition_value' => 'integer',
            'reward_points' => 'integer',
        ];
    }

    public function users(): BelongsToMany
    {
        // user_achievementsテーブルを通して「どのユーザーがどの称号を獲得したか」を表します。
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withPivot('earned_at')
            ->withTimestamps();
    }
}
