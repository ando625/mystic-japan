<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AchievementResource;
use App\Models\Achievement;
use App\Services\AchievementService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// 称号一覧と、ユーザーごとの達成状況を返すControllerです。
class AchievementController extends Controller
{
    // 称号マスタに対して、獲得済みかどうかと現在の進捗を付けて返します。
    public function index(Request $request, AchievementService $achievementService): AnonymousResourceCollection
    {
        // auth:sanctumを通過しているため、ここではログインユーザーを取得できます。
        $user = $request->user();

        // user_achievementsから「獲得済み称号ID => 獲得日時」の形で取り出します。
        // 後で各Achievementにis_earnedを付けるための下準備です。
        $earned = $user->achievements()->pluck('user_achievements.earned_at', 'achievements.id');

        // 称号マスタは全件表示します。未達成の称号も画面に出すためです。
        $achievements = Achievement::query()->orderBy('id')->get();

        $achievements->each(function (Achievement $achievement) use ($achievementService, $earned, $user): void {
            // Resourceで表示しやすいよう、DBカラムではない一時的な属性を追加しています。
            $achievement->setAttribute('is_earned', $earned->has($achievement->id));
            $achievement->setAttribute('earned_at', $earned[$achievement->id] ?? null);
            $achievement->setAttribute('progress', $achievementService->progressFor($user, $achievement));
        });

        return AchievementResource::collection($achievements);
    }
}
