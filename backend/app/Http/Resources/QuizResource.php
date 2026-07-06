<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class QuizResource extends JsonResource
{
    /**
     * The correct option is intentionally hidden until the user answers.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'spot_id' => $this->spot_id,
            'question' => $this->question,
            'options' => [
                'A' => $this->option_a,
                'B' => $this->option_b,
                'C' => $this->option_c,
                'D' => $this->option_d,
            ],
            'explanation' => $this->when((bool) ($this->answered_at ?? false), $this->explanation),
            'reward_points' => $this->reward_points,
            'answered_at' => $this->answered_at ? Carbon::parse($this->answered_at)->toISOString() : null,
            'selected_option' => $this->selected_option,
            'is_correct' => $this->is_correct,
        ];
    }
}
