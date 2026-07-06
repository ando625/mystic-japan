<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    public const OPTION_A = 'A';

    public const OPTION_B = 'B';

    public const OPTION_C = 'C';

    public const OPTION_D = 'D';

    protected $fillable = [
        'spot_id',
        'question',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'correct_option',
        'explanation',
        'reward_points',
    ];

    protected function casts(): array
    {
        return [
            'reward_points' => 'integer',
        ];
    }

    public function spot(): BelongsTo
    {
        return $this->belongsTo(Spot::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }
}
