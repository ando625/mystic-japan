<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Spot;
use App\Models\User;
use App\Services\ProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

// ログイン、新規登録、ログアウト、現在のユーザー情報を扱うControllerです。
class AuthController extends Controller
{
    // 新規登録後、初期解放スポットをユーザー進行に反映してトークンを返します。
    public function register(Request $request, ProgressService $progress): JsonResponse
    {
        // passwordはconfirmedなので、フロントからpassword_confirmationも送る必要があります。
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Userモデルのpassword castにより、保存時に自動でハッシュ化されます。
        $user = User::query()->create($validated);

        // 登録直後から遊べるよう、初期解放スポットをuser_spots/collectionsへ作成します。
        $progress->ensureInitialSpots($user);

        return response()->json([
            'user' => $this->userPayload($user),
            'token' => $user->createToken('frontend')->plainTextToken,
        ], 201);
    }

    // メールアドレスとパスワードを確認し、ログイン用トークンを返します。
    public function login(Request $request, ProgressService $progress): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // メールアドレスからユーザーを探し、見つからない場合は同じエラーとして扱います。
        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            // どちらが間違っているかを出し分けると安全性が下がるため、同じメッセージにしています。
            throw ValidationException::withMessages([
                'email' => ['メールアドレスまたはパスワードが正しくありません。'],
            ]);
        }

        // 既存ユーザーにも初期解放データが無ければ補完します。
        $progress->ensureInitialSpots($user);

        return response()->json([
            'user' => $this->userPayload($user),
            'token' => $user->createToken('frontend')->plainTextToken,
        ]);
    }

    // 現在使っているアクセストークンを削除してログアウト状態にします。
    public function logout(Request $request): JsonResponse
    {
        // 現在のリクエストで使われたSanctumトークンだけを削除します。
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    // マイページなどで使う、ユーザー情報と進捗サマリーを返します。
    public function me(Request $request, ProgressService $progress): JsonResponse
    {
        $user = $request->user();
        $progress->ensureInitialSpots($user);

        // マイページ用に、スポット総数とユーザーの解放数を集計します。
        $totalSpots = Spot::query()->count();
        $unlockedCount = $user->collections()->count();

        return response()->json([
            'user' => $this->userPayload($user),
            'summary' => [
                'unlocked_count' => $unlockedCount,
                'total_spots' => $totalSpots,
                'completion_rate' => $totalSpots === 0 ? 0 : round(($unlockedCount / $totalSpots) * 100, 1),
                'mystic_points' => $progress->totalPoints($user),
                'achievement_count' => $user->achievements()->count(),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(User $user): array
    {
        // フロントに返してよいユーザー情報だけをここで絞ります。
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
}
