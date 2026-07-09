<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// quiz_answersテーブルのModelです。
// 「誰が、どのクイズに、どの選択肢で答えたか」を保存します。
class QuizAnswer extends Model
{
    protected $fillable = [
        // user_idとquiz_idでユーザーごとの回答履歴を識別します。
        'user_id',
        'quiz_id',
        'selected_option',
        'is_correct',
        'answered_at',
    ];

    protected function casts(): array
    {
        return [
            // 採点結果と回答日時を、PHP側で扱いやすい型に変換します。
            'is_correct' => 'boolean',
            'answered_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        // この回答をしたユーザーです。
        return $this->belongsTo(User::class);
    }

    public function quiz(): BelongsTo
    {
        // 回答対象のクイズです。ここからスポット情報にも辿れます。
        return $this->belongsTo(Quiz::class);
    }
}
