<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSpot extends Model
{
    protected $fillable = [
        'user_id',
        'spot_id',
        'is_unlocked',
        'unlocked_at',
        'visited_at',
    ];

    protected function casts(): array
    {
        return [
            'is_unlocked' => 'boolean',
            'unlocked_at' => 'datetime',
            'visited_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function spot(): BelongsTo
    {
        return $this->belongsTo(Spot::class);
    }
}
