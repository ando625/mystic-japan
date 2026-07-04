<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SpotResource extends JsonResource
{
    /**
     * Keep the API shape stable for the frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'region' => $this->region,
            'prefecture' => $this->prefecture,
            'category' => $this->category,
            'description' => $this->description,
            'mythology' => $this->when($this->resource->relationLoaded('collections') || $request->routeIs('spots.show'), $this->mythology),
            'history' => $this->when($this->resource->relationLoaded('collections') || $request->routeIs('spots.show'), $this->history),
            'trivia' => $this->when($this->resource->relationLoaded('collections') || $request->routeIs('spots.show'), $this->trivia),
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'image_url' => $this->image_url,
            'music_url' => $this->when($request->routeIs('spots.show'), $this->music_url),
            'video_url' => $this->when($request->routeIs('spots.show'), $this->video_url),
            'rarity' => $this->rarity,
            'mystic_points' => $this->mystic_points,
            'is_unlocked' => (bool) ($this->is_unlocked ?? false),
        ];
    }
}
