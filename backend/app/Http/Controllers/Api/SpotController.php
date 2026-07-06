<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SpotResource;
use App\Models\Spot;
use App\Services\ProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SpotController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:255'],
            'unlocked' => ['nullable', 'boolean'],
        ]);

        $query = Spot::query()->with('stamp')->orderBy('id');

        if (! empty($validated['category'])) {
            $query->where('category', $validated['category']);
        }

        if (! empty($validated['region'])) {
            $query->where('region', $validated['region']);
        }

        $user = $request->user();

        if ($user && array_key_exists('unlocked', $validated)) {
            $spotIds = $user->spotProgress()->where('is_unlocked', true)->pluck('spot_id');
            $validated['unlocked']
                ? $query->whereIn('id', $spotIds)
                : $query->whereNotIn('id', $spotIds);
        }

        $spots = $query->get();
        $this->markUnlocked($spots, $user);

        return SpotResource::collection($spots);
    }

    public function show(Request $request, Spot $spot): SpotResource
    {
        $spot->load('stamp');
        $this->markUnlocked(collect([$spot]), $request->user());

        return new SpotResource($spot);
    }

    public function unlock(Request $request, Spot $spot, ProgressService $progress): JsonResponse
    {
        $result = $progress->unlockSpot($request->user(), $spot);

        return response()->json([
            'collection' => [
                'spot_id' => $spot->id,
                'unlocked_at' => $result['progress']->unlocked_at?->toISOString(),
            ],
            'gained_points' => $result['gained_points'],
            'new_achievements' => $result['new_achievements']->map(fn ($achievement) => [
                'id' => $achievement->id,
                'title' => $achievement->title,
            ])->values(),
            'already_unlocked' => $result['already_unlocked'],
        ], $result['already_unlocked'] ? 200 : 201);
    }

    public function visit(Request $request, Spot $spot, ProgressService $progress): JsonResponse
    {
        $result = $progress->visitSpot($request->user(), $spot->load('stamp'));

        return response()->json([
            'spot_id' => $spot->id,
            'visited_at' => $result['progress']->visited_at?->toISOString(),
            'stamp_obtained' => $result['stamp_obtained'],
            'stamp' => $result['stamp'] ? [
                'id' => $result['stamp']->id,
                'name' => $result['stamp']->name,
                'rarity' => $result['stamp']->rarity,
            ] : null,
        ]);
    }

    private function markUnlocked($spots, $user): void
    {
        if (! $user) {
            $spots->each->setAttribute('is_unlocked', false);

            return;
        }

        app(ProgressService::class)->ensureInitialSpots($user);

        $progress = $user->spotProgress()
            ->whereIn('spot_id', $spots->pluck('id'))
            ->get()
            ->keyBy('spot_id');

        $obtainedStamps = $user->stamps()->pluck('user_stamps.obtained_at', 'stamps.id');

        $spots->each(function (Spot $spot) use ($progress, $obtainedStamps): void {
            $spotProgress = $progress->get($spot->id);
            $spot->setAttribute('is_unlocked', (bool) $spotProgress?->is_unlocked);
            $spot->setAttribute('visited_at', $spotProgress?->visited_at);

            if ($spot->stamp) {
                $spot->stamp->setAttribute('is_obtained', $obtainedStamps->has($spot->stamp->id));
                $spot->stamp->setAttribute('obtained_at', $obtainedStamps[$spot->stamp->id] ?? null);
            }
        });
    }
}
