<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StampResource;
use App\Models\Stamp;
use App\Services\ProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

// 御朱印帳に表示する御朱印一覧と、ユーザーの獲得状態を扱うControllerです。
class StampController extends Controller
{
    // 未ログインなら未獲得状態、ログイン済みならuser_stampsを見て獲得状態を付けて返します。
    public function index(Request $request, ProgressService $progress): AnonymousResourceCollection
    {
        $user = $request->user() ?? Auth::guard('sanctum')->user();

        if ($user) {
            // ログイン済みなら初期進行を補完してから御朱印状態を作ります。
            $progress->ensureInitialSpots($user);
        }

        // user_stampsから「stamp_id => obtained_at」の形で取得します。
        $obtained = $user
            ? $user->stamps()->pluck('user_stamps.obtained_at', 'stamps.id')
            : collect();

        // 御朱印帳では未獲得も表示するため、stampsテーブルは全件取得します。
        $stamps = Stamp::query()
            ->with('spot')
            ->orderBy('id')
            ->get();

        $stamps->each(function (Stamp $stamp) use ($obtained): void {
            // Resourceでis_obtained/obtained_atを返せるよう、表示用属性を追加します。
            $stamp->setAttribute('is_obtained', $obtained->has($stamp->id));
            $stamp->setAttribute('obtained_at', $obtained[$stamp->id] ?? null);
        });

        return StampResource::collection($stamps);
    }

    // 認証ユーザー用の御朱印一覧です。内部的にはindexと同じ整形を使います。
    public function mine(Request $request, ProgressService $progress): AnonymousResourceCollection
    {
        $progress->ensureInitialSpots($request->user());

        return $this->index($request, $progress);
    }

    // 管理用・互換用の御朱印獲得APIです。通常の画面ではクイズ達成時に獲得します。
    public function obtain(Request $request, Stamp $stamp, ProgressService $progress): JsonResponse
    {
        // obtainStampは重複獲得を防ぎ、初回だけuser_stampsを作成します。
        $result = $progress->obtainStamp($request->user(), $stamp);
        $obtainedAt = $request->user()->stamps()
            ->whereKey($stamp->id)
            ->value('user_stamps.obtained_at');
        $result['stamp']->setAttribute('is_obtained', true);
        $result['stamp']->setAttribute('obtained_at', $obtainedAt ? Carbon::parse($obtainedAt) : null);

        return response()->json([
            'stamp' => new StampResource($result['stamp']->load('spot')),
            'already_obtained' => $result['already_obtained'],
        ], $result['already_obtained'] ? 200 : 201);
    }
}
