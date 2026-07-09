<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// collectionsテーブルのModelです。
// ユーザーが解放済みのスポットを、図鑑コレクションとして記録します。
class Collection extends Model
{
    protected $fillable = [
        // user_idとspot_idの組み合わせで「このユーザーがこのスポットを解放した」ことを表します。
        'user_id',
        'spot_id',
        'unlocked_at',
    ];

    protected function casts(): array
    {
        return [
            // unlocked_atはCarbon日時として扱い、APIでISO文字列へ変換しやすくします。
            'unlocked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        // この解放記録を持っているユーザーです。
        return $this->belongsTo(User::class);
    }

    public function spot(): BelongsTo
    {
        // 解放された対象スポットです。
        return $this->belongsTo(Spot::class);
    }
}
