<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStamp extends Model
{
    protected $fillable = [
        'user_id',
        'stamp_id',
        'obtained_at',
    ];

    protected function casts(): array
    {
        return [
            'obtained_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function stamp(): BelongsTo
    {
        return $this->belongsTo(Stamp::class);
    }
}
