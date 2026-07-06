<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'images' => 'array',
            'rarity' => 'integer',
            'mystic_points' => 'integer',
        ];
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }
}
