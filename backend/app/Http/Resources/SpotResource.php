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
        $showsLore = $this->resource->relationLoaded('collections') || $request->routeIs('spots.show');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'region' => $this->region,
            'prefecture' => $this->prefecture,
            'category' => $this->category,
            'description' => $this->description,
            'mythology' => $this->when($showsLore, $this->mythology),
            'history' => $this->when($showsLore, $this->history),
            'trivia' => $this->when($showsLore, $this->trivia),
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'image_url' => $this->image_url,
            'images' => $this->images ?: array_values(array_filter([$this->image_url])),
            'media' => $this->mediaItems(),
            'music_url' => $this->when($request->routeIs('spots.show'), $this->music_url),
            'video_url' => $this->when($request->routeIs('spots.show'), $this->video_url),
            'rarity' => $this->rarity,
            'mystic_points' => $this->mystic_points,
            'is_initially_unlocked' => (bool) $this->is_initially_unlocked,
            'is_unlocked' => (bool) ($this->is_unlocked ?? false),
            'unlocked_at' => $this->isoDate($this->unlocked_at),
            'visited_at' => $this->isoDate($this->visited_at),
            'user_progress' => $this->userProgress(),
            'unlock_condition' => $this->unlock_condition ?? 'ログイン後、神域の記憶を読み進めるか神話クイズに正解すると解放できます。',
            'stamp_obtained' => (bool) ($this->stamp?->is_obtained ?? false),
            'obtained_at' => $this->isoDate($this->stamp?->obtained_at),
            'total_points' => (int) ($this->total_points ?? 0),
            'answered_quiz_ids' => $this->answered_quiz_ids ?? [],
            'stamp' => $this->stampPayload(),
            'quizzes' => $this->quizSummary(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function userProgress(): array
    {
        return [
            'is_unlocked' => (bool) ($this->is_unlocked ?? false),
            'unlocked_at' => $this->isoDate($this->unlocked_at),
            'visited_at' => $this->isoDate($this->visited_at),
            'stamp_obtained' => (bool) ($this->stamp?->is_obtained ?? false),
            'total_points' => (int) ($this->total_points ?? 0),
            'answered_quiz_ids' => $this->answered_quiz_ids ?? [],
        ];
    }

    private function stampPayload(): mixed
    {
        return $this->when($this->stamp, fn () => [
            'id' => $this->stamp->id,
            'name' => $this->stamp->name,
            'description' => $this->stamp->description,
            'image_path' => $this->stamp->image_path,
            'rarity' => $this->stamp->rarity,
            'is_obtained' => (bool) ($this->stamp->is_obtained ?? false),
            'obtained_at' => $this->isoDate($this->stamp->obtained_at),
        ]);
    }

    private function quizSummary(): mixed
    {
        return $this->whenLoaded('quizzes', fn () => $this->quizzes->map(fn ($quiz) => [
            'id' => $quiz->id,
            'question' => $quiz->question,
            'reward_points' => $quiz->reward_points,
        ])->values());
    }

    private function isoDate(mixed $value): ?string
    {
        return $value ? Carbon::parse($value)->toISOString() : null;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function mediaItems(): array
    {
        $items = collect($this->images ?: array_values(array_filter([$this->image_url])))
            ->filter()
            ->unique()
            ->values()
            ->map(fn (string $url, int $index) => [
                'id' => "image-{$index}",
                'type' => 'image',
                'url' => $url,
                'thumbnailUrl' => $url,
                'alt' => $this->name,
            ]);

        if ($this->video_url) {
            $items->push([
                'id' => 'video-main',
                'type' => 'video',
                'url' => $this->video_url,
                'thumbnailUrl' => $this->image_url,
                'alt' => "{$this->name} 動画",
            ]);
        }

        return $items->values()->all();
    }
}
