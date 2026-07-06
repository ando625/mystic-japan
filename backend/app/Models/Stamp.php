<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Stamp extends Model
{
    protected $fillable = [
        'spot_id',
        'name',
        'description',
        'image_path',
        'rarity',
    ];

    protected function casts(): array
    {
        return [
            'rarity' => 'integer',
        ];
    }

    public function spot(): BelongsTo
    {
        return $this->belongsTo(Spot::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_stamps')
            ->withPivot('obtained_at')
            ->withTimestamps();
    }
}
