<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class StampResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'spot_id' => $this->spot_id,
            'spot_name' => $this->spot?->name,
            'region' => $this->spot?->region,
            'name' => $this->name,
            'description' => $this->description,
            'image_path' => $this->image_path,
            'rarity' => $this->rarity,
            'is_obtained' => (bool) ($this->is_obtained ?? false),
            'obtained_at' => $this->obtained_at ? Carbon::parse($this->obtained_at)->toISOString() : null,
        ];
    }
}
