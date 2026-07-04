<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AchievementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'condition_type' => $this->condition_type,
            'condition_value' => $this->condition_value,
            'condition_category' => $this->condition_category,
            'icon_name' => $this->icon_name,
            'reward_points' => $this->reward_points,
            'is_earned' => (bool) ($this->is_earned ?? false),
            'earned_at' => $this->earned_at,
            'progress' => $this->progress ?? [
                'current' => 0,
                'target' => $this->condition_value,
            ],
        ];
    }
}
