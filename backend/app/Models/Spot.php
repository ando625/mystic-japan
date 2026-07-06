<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Spot extends Model
{
    use HasFactory;

    public const CATEGORY_SHRINE_TEMPLE = 'shrine_temple';

    public const CATEGORY_NATURE = 'nature';

    public const CATEGORY_SEA_LAKE = 'sea_lake';

    public const CATEGORY_MYTH = 'myth';

    public const CATEGORY_FOREST_MOUNTAIN = 'forest_mountain';

    public const CATEGORY_OTHER = 'other';

    protected $fillable = [
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
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'images' => 'array',
            'rarity' => 'integer',
            'mystic_points' => 'integer',
            'is_initially_unlocked' => 'boolean',
        ];
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function userSpots(): HasMany
    {
        return $this->hasMany(UserSpot::class);
    }

    public function stamp(): HasOne
    {
        return $this->hasOne(Stamp::class);
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }
}
