<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// user_stampsテーブルのModelです。
// ユーザーが獲得した御朱印と獲得日時を保存します。
class UserStamp extends Model
{
    protected $fillable = [
        // user_idとstamp_idの組み合わせで、誰がどの御朱印を持っているかを表します。
        'user_id',
        'stamp_id',
        'obtained_at',
    ];

    protected function casts(): array
    {
        return [
            // 獲得日時をCarbonとして扱い、表示時に整形しやすくします。
            'obtained_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        // 御朱印を獲得したユーザーです。
        return $this->belongsTo(User::class);
    }

    public function stamp(): BelongsTo
    {
        // 獲得対象の御朱印マスタです。
        return $this->belongsTo(Stamp::class);
    }
}
