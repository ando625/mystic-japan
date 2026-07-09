<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

// stampsテーブルのModelです。
// スポットごとに用意された御朱印マスタを表します。
class Stamp extends Model
{
    protected $fillable = [
        // spot_idで対象スポットを指定し、表示名・説明・画像パス・レア度を持ちます。
        'spot_id',
        'name',
        'description',
        'image_path',
        'rarity',
    ];

    protected function casts(): array
    {
        return [
            // レア度表示の星数として使うためintegerにします。
            'rarity' => 'integer',
        ];
    }

    public function spot(): BelongsTo
    {
        // この御朱印が対応しているスポットです。
        return $this->belongsTo(Spot::class);
    }

    public function users(): BelongsToMany
    {
        // user_stampsテーブルを通して「どのユーザーが獲得したか」を表します。
        return $this->belongsToMany(User::class, 'user_stamps')
            ->withPivot('obtained_at')
            ->withTimestamps();
    }
}
