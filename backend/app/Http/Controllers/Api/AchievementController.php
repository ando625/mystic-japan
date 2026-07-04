<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AchievementResource;
use App\Models\Achievement;
use App\Services\AchievementService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AchievementController extends Controller
{
    public function index(Request $request, AchievementService $achievementService): AnonymousResourceCollection
    {
        $user = $request->user();
        $earned = $user->achievements()->pluck('user_achievements.earned_at', 'achievements.id');

        $achievements = Achievement::query()->orderBy('id')->get();

        $achievements->each(function (Achievement $achievement) use ($achievementService, $earned, $user): void {
            $achievement->setAttribute('is_earned', $earned->has($achievement->id));
            $achievement->setAttribute('earned_at', $earned[$achievement->id] ?? null);
            $achievement->setAttribute('progress', $achievementService->progressFor($user, $achievement));
        });

        return AchievementResource::collection($achievements);
    }
}
