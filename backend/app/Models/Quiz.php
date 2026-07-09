<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// quizzesテーブルのModelです。
// 各スポットに紐づく4択クイズを表します。
class Quiz extends Model
{
    // correct_option / selected_option で使う選択肢の値です。
    public const OPTION_A = 'A';

    public const OPTION_B = 'B';

    public const OPTION_C = 'C';

    public const OPTION_D = 'D';

    protected $fillable = [
        // Seederでスポットごとの問題文、選択肢、正解、解説、報酬ポイントを登録します。
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
            // reward_pointsは加算計算に使うためintegerとして扱います。
            'reward_points' => 'integer',
        ];
    }

    public function spot(): BelongsTo
    {
        // このクイズが属しているスポットです。spot_idでspotsテーブルとつながります。
        return $this->belongsTo(Spot::class);
    }

    public function answers(): HasMany
    {
        // このクイズに対するユーザー回答履歴です。1つのクイズに複数ユーザーの回答が付きます。
        return $this->hasMany(QuizAnswer::class);
    }
}
