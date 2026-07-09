<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// user_spotsテーブルのModelです。
// ユーザーごとのスポット進行状態を保存します。
class UserSpot extends Model
{
    protected $fillable = [
        // is_unlockedで解放状態、unlocked_at/visited_atで日時を管理します。
        'user_id',
        'spot_id',
        'is_unlocked',
        'unlocked_at',
        'visited_at',
    ];

    protected function casts(): array
    {
        return [
            // APIでtrue/falseや日時として扱えるように型変換します。
            'is_unlocked' => 'boolean',
            'unlocked_at' => 'datetime',
            'visited_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        // この進行状態を持つユーザーです。
        return $this->belongsTo(User::class);
    }

    public function spot(): BelongsTo
    {
        // 進行対象のスポットです。
        return $this->belongsTo(Spot::class);
    }
}
