<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SpotResource;
use App\Models\Spot;
use App\Services\ProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// ユーザーの解放済みスポットと図鑑進捗を返すControllerです。
class CollectionController extends Controller
{
    // 図鑑画面で使う、解放済みスポット一覧と達成率を返します。
    public function index(Request $request, ProgressService $progress): JsonResponse
    {
        $user = $request->user();
        $progress->ensureInitialSpots($user);

        // 図鑑の達成率を計算するため、全スポット数とユーザーの解放済み数を使います。
        $totalSpots = Spot::query()->count();
        $unlockedCount = $user->collections()->count();

        // collectionsに記録されているspot_idだけを取り出して、解放済みスポット一覧を作ります。
        $spots = Spot::query()
            ->whereIn('id', $user->collections()->pluck('spot_id'))
            ->orderBy('id')
            ->get();

        // Resource側でロック表示に戻らないよう、ここでは明示的に解放済み属性を付けます。
        $spots->each->setAttribute('is_unlocked', true);

        return response()->json([
            'summary' => [
                'unlocked_count' => $unlockedCount,
                'total_spots' => $totalSpots,
                'completion_rate' => $totalSpots === 0 ? 0 : round(($unlockedCount / $totalSpots) * 100, 1),
                'mystic_points' => $progress->totalPoints($user),
            ],
            'data' => SpotResource::collection($spots),
        ]);
    }
}
