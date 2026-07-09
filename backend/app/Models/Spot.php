<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

// spotsテーブルのModelです。
// 日本各地の神秘スポット本体を表し、画像・BGM・神話・歴史・位置情報を持ちます。
class Spot extends Model
{
    use HasFactory;

    // categoryに保存する値です。フロントではこの値を表示ラベルに変換しています。
    public const CATEGORY_SHRINE_TEMPLE = 'shrine_temple';

    public const CATEGORY_NATURE = 'nature';

    public const CATEGORY_SEA_LAKE = 'sea_lake';

    public const CATEGORY_MYTH = 'myth';

    public const CATEGORY_FOREST_MOUNTAIN = 'forest_mountain';

    public const CATEGORY_OTHER = 'other';

    protected $fillable = [
        // Seederや管理処理から一括登録できるスポット情報です。
        'name',
        'region',
        'prefecture',
        'category',
        'description',
        'mythology',
        'history',
        'trivia',
        'latitude',
        'longitude',
        'image_url',
        'images',
        'music_url',
        'video_url',
        'rarity',
        'mystic_points',
        'is_initially_unlocked',
    ];

    protected function casts(): array
    {
        return [
            // 地図表示で使う緯度・経度です。decimal指定で小数精度を揃えます。
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            // imagesはJSON配列としてDBへ保存し、PHPではarrayとして扱います。
            'images' => 'array',
            'rarity' => 'integer',
            'mystic_points' => 'integer',
            // 初回ログイン時に最初から解放するスポットかどうかです。
            'is_initially_unlocked' => 'boolean',
        ];
    }

    public function collections(): HasMany
    {
        // 図鑑として解放された履歴です。スポット側から複数ユーザーの解放履歴を見られます。
        return $this->hasMany(Collection::class);
    }

    public function userSpots(): HasMany
    {
        // ユーザーごとの詳細進行です。解放状態や訪問日時を保存します。
        return $this->hasMany(UserSpot::class);
    }

    public function stamp(): HasOne
    {
        // このスポットで獲得できる御朱印です。1スポットにつき1つの想定です。
        return $this->hasOne(Stamp::class);
    }

    public function quizzes(): HasMany
    {
        // このスポットに用意された神話クイズです。現在は各スポット4問の想定です。
        return $this->hasMany(Quiz::class);
    }
}
