<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SpotResource;
use App\Models\Spot;
use App\Services\AchievementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    public function index(Request $request, AchievementService $achievements): JsonResponse
    {
        $user = $request->user();
        $totalSpots = Spot::query()->count();
        $unlockedCount = $user->collections()->count();

        $spots = Spot::query()
            ->whereIn('id', $user->collections()->pluck('spot_id'))
            ->orderBy('id')
            ->get();

        $spots->each->setAttribute('is_unlocked', true);

        return response()->json([
            'summary' => [
                'unlocked_count' => $unlockedCount,
                'total_spots' => $totalSpots,
                'completion_rate' => $totalSpots === 0 ? 0 : round(($unlockedCount / $totalSpots) * 100, 1),
                'mystic_points' => $achievements->mysticPointsTotal($user),
            ],
            'data' => SpotResource::collection($spots),
        ]);
    }
}
