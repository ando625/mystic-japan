<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// user_achievementsテーブルのModelです。
// ユーザーが獲得した称号と獲得日時を保存する中間テーブルです。
class UserAchievement extends Model
{
    protected $fillable = [
        // user_idとachievement_idの組み合わせで、誰がどの称号を獲得したかを表します。
        'user_id',
        'achievement_id',
        'earned_at',
    ];

    protected function casts(): array
    {
        return [
            // 獲得日時をCarbonとして扱います。
            'earned_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        // 称号を獲得したユーザーです。
        return $this->belongsTo(User::class);
    }

    public function achievement(): BelongsTo
    {
        // 獲得対象の称号マスタです。
        return $this->belongsTo(Achievement::class);
    }
}
