<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

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
            'images' => $this->images ?: array_values(array_filter([$this->image_url])),
            'music_url' => $this->when($request->routeIs('spots.show'), $this->music_url),
            'video_url' => $this->when($request->routeIs('spots.show'), $this->video_url),
            'rarity' => $this->rarity,
            'mystic_points' => $this->mystic_points,
            'is_initially_unlocked' => (bool) $this->is_initially_unlocked,
            'is_unlocked' => (bool) ($this->is_unlocked ?? false),
            'visited_at' => $this->visited_at ? Carbon::parse($this->visited_at)->toISOString() : null,
            'unlock_condition' => $this->unlock_condition ?? 'ログイン後、神域の記憶を読み進めるか神話クイズに正解すると解放できます。',
            'stamp' => $this->when($this->stamp, fn () => [
                'id' => $this->stamp->id,
                'name' => $this->stamp->name,
                'description' => $this->stamp->description,
                'image_path' => $this->stamp->image_path,
                'rarity' => $this->stamp->rarity,
                'is_obtained' => (bool) ($this->stamp->is_obtained ?? false),
                'obtained_at' => $this->stamp->obtained_at ? Carbon::parse($this->stamp->obtained_at)->toISOString() : null,
            ]),
        ];
    }
}
