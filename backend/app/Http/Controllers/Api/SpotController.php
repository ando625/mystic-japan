<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SpotResource;
use App\Models\Spot;
use App\Services\ProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

// スポット一覧・詳細・解放状態・訪問記録を扱うControllerです。
class SpotController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        // 一覧画面のタブやフィルタから渡される条件だけを受け付けます。
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:255'],
            'unlocked' => ['nullable', 'boolean'],
        ]);

        // spotsテーブルを起点に、御朱印情報も一緒に取得します。
        $query = Spot::query()->with('stamp')->orderBy('id');

        if (! empty($validated['category'])) {
            $query->where('category', $validated['category']);
        }

        if (! empty($validated['region'])) {
            $query->where('region', $validated['region']);
        }

        // tokenがあればログインユーザー、なければnullになります。
        $user = $this->optionalUser($request);

        if ($user && array_key_exists('unlocked', $validated)) {
            // 認証済みの場合だけ、ユーザーごとの解放状態で絞り込みます。
            $spotIds = $user->spotProgress()->where('is_unlocked', true)->pluck('spot_id');
            $validated['unlocked']
                ? $query->whereIn('id', $spotIds)
                : $query->whereNotIn('id', $spotIds);
        }

        // 最後に、各Spotモデルへis_unlockedやstamp.is_obtainedなどの表示用属性を付けます。
        $spots = $query->get();
        $this->markUnlocked($spots, $user);

        return SpotResource::collection($spots);
    }

    public function show(Request $request, Spot $spot): SpotResource
    {
        // 詳細画面では御朱印とクイズ概要も一緒に返し、画面側の追加取得を減らします。
        $spot->load(['stamp', 'quizzes']);

        // 詳細画面でも、ログインユーザーの進行状態を同じ形で注入します。
        $this->markUnlocked(collect([$spot]), $this->optionalUser($request));

        return new SpotResource($spot);
    }

    public function unlock(Request $request, Spot $spot, ProgressService $progress): JsonResponse
    {
        // 現在のUIでは手動解放しませんが、互換用APIとして残しています。
        $result = $progress->unlockSpot($request->user(), $spot);

        return response()->json([
            'collection' => [
                'spot_id' => $spot->id,
                'unlocked_at' => $result['progress']->unlocked_at?->toISOString(),
            ],
            'user_progress' => [
                'is_unlocked' => (bool) $result['progress']->is_unlocked,
                'unlocked_at' => $result['progress']->unlocked_at?->toISOString(),
                'visited_at' => $result['progress']->visited_at?->toISOString(),
                'stamp_obtained' => false,
                'total_points' => $progress->totalPoints($request->user()),
                'answered_quiz_ids' => $this->answeredQuizIds($request->user(), $spot),
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
        // 訪問記録は残せますが、御朱印はクイズ達成時だけ付与します。
        $result = $progress->visitSpot($request->user(), $spot->load('stamp'));
        $obtainedAt = $result['stamp']
            ? $request->user()->stamps()->whereKey($result['stamp']->id)->value('user_stamps.obtained_at')
            : null;

        return response()->json([
            'spot_id' => $spot->id,
            'visited_at' => $result['progress']->visited_at?->toISOString(),
            'stamp_obtained' => (bool) $result['stamp'],
            'stamp' => $result['stamp'] ? [
                'id' => $result['stamp']->id,
                'spot_id' => $spot->id,
                'name' => $result['stamp']->name,
                'description' => $result['stamp']->description,
                'image_path' => $result['stamp']->image_path,
                'rarity' => $result['stamp']->rarity,
                'is_obtained' => true,
                'obtained_at' => $obtainedAt ? Carbon::parse($obtainedAt)->toISOString() : null,
            ] : null,
            'user_progress' => [
                'is_unlocked' => (bool) $result['progress']->is_unlocked,
                'unlocked_at' => $result['progress']->unlocked_at?->toISOString(),
                'visited_at' => $result['progress']->visited_at?->toISOString(),
                'stamp_obtained' => (bool) $result['stamp'],
                'total_points' => $progress->totalPoints($request->user()),
                'answered_quiz_ids' => $this->answeredQuizIds($request->user(), $spot),
            ],
        ]);
    }

    private function markUnlocked($spots, $user): void
    {
        if (! $user) {
            // 未ログイン時は個人進行を持たないため、すべて未解放扱いで返します。
            $spots->each->setAttribute('is_unlocked', false);

            return;
        }

        // 初期解放スポットを保証してから、ユーザーごとの進行状態をスポットへ注入します。
        app(ProgressService::class)->ensureInitialSpots($user);

        $progress = $user->spotProgress()
            ->whereIn('spot_id', $spots->pluck('id'))
            ->get()
            ->keyBy('spot_id');

        $obtainedStamps = $user->stamps()->pluck('user_stamps.obtained_at', 'stamps.id');
        $answeredQuizIds = $user->quizAnswers()
            ->whereHas('quiz', fn ($query) => $query->whereIn('spot_id', $spots->pluck('id')))
            ->pluck('quiz_id')
            ->values();
        $totalPoints = app(ProgressService::class)->totalPoints($user);

        $spots->each(function (Spot $spot) use ($progress, $obtainedStamps, $answeredQuizIds, $totalPoints): void {
            // Resourceで同じ形に整形できるよう、Modelの一時属性として進行状態を持たせます。
            $spotProgress = $progress->get($spot->id);
            $spot->setAttribute('is_unlocked', (bool) $spotProgress?->is_unlocked);
            $spot->setAttribute('unlocked_at', $spotProgress?->unlocked_at);
            $spot->setAttribute('visited_at', $spotProgress?->visited_at);
            $spot->setAttribute('total_points', $totalPoints);
            $spot->setAttribute('answered_quiz_ids', $answeredQuizIds);

            if ($spot->stamp) {
                $spot->stamp->setAttribute('is_obtained', $obtainedStamps->has($spot->stamp->id));
                $spot->stamp->setAttribute('obtained_at', $obtainedStamps[$spot->stamp->id] ?? null);
            }
        });
    }

    private function optionalUser(Request $request)
    {
        // 通常は$request->user()で取れますが、公開APIでもBearerトークンがあれば拾えるようにしています。
        return $request->user() ?? Auth::guard('sanctum')->user();
    }

    private function answeredQuizIds($user, Spot $spot): array
    {
        // フロントで「このスポットのどのクイズに回答済みか」を判断するためのID一覧です。
        return $user->quizAnswers()
            ->whereHas('quiz', fn ($query) => $query->where('spot_id', $spot->id))
            ->pluck('quiz_id')
            ->values()
            ->all();
    }
}
