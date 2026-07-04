<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SpotResource;
use App\Models\Collection;
use App\Models\Spot;
use App\Services\AchievementService;
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

        $query = Spot::query()->orderBy('id');

        if (! empty($validated['category'])) {
            $query->where('category', $validated['category']);
        }

        if (! empty($validated['region'])) {
            $query->where('region', $validated['region']);
        }

        $user = $request->user();

        if ($user && array_key_exists('unlocked', $validated)) {
            $spotIds = $user->collections()->pluck('spot_id');
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
        $this->markUnlocked(collect([$spot]), $request->user());

        return new SpotResource($spot);
    }

    public function unlock(Request $request, Spot $spot, AchievementService $achievements): JsonResponse
    {
        $user = $request->user();

        $collection = Collection::query()->firstOrCreate(
            [
                'user_id' => $user->id,
                'spot_id' => $spot->id,
            ],
            [
                'unlocked_at' => now(),
            ],
        );

        $alreadyUnlocked = ! $collection->wasRecentlyCreated;
        $newAchievements = $alreadyUnlocked ? collect() : $achievements->grantUnlockedAchievements($user);

        return response()->json([
            'collection' => [
                'spot_id' => $spot->id,
                'unlocked_at' => $collection->unlocked_at?->toISOString(),
            ],
            'gained_points' => $alreadyUnlocked ? 0 : $spot->mystic_points,
            'new_achievements' => $newAchievements->map(fn ($achievement) => [
                'id' => $achievement->id,
                'title' => $achievement->title,
            ])->values(),
            'already_unlocked' => $alreadyUnlocked,
        ], $alreadyUnlocked ? 200 : 201);
    }

    private function markUnlocked($spots, $user): void
    {
        if (! $user) {
            $spots->each->setAttribute('is_unlocked', false);

            return;
        }

        $unlockedIds = $user->collections()
            ->whereIn('spot_id', $spots->pluck('id'))
            ->pluck('spot_id')
            ->all();

        $spots->each(function (Spot $spot) use ($unlockedIds): void {
            $spot->setAttribute('is_unlocked', in_array($spot->id, $unlockedIds, true));
        });
    }
}
