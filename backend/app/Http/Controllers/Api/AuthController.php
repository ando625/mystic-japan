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

class AuthController extends Controller
{
    public function register(Request $request, ProgressService $progress): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::query()->create($validated);
        $progress->ensureInitialSpots($user);

        return response()->json([
            'user' => $this->userPayload($user),
            'token' => $user->createToken('frontend')->plainTextToken,
        ], 201);
    }

    public function login(Request $request, ProgressService $progress): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['メールアドレスまたはパスワードが正しくありません。'],
            ]);
        }

        $progress->ensureInitialSpots($user);

        return response()->json([
            'user' => $this->userPayload($user),
            'token' => $user->createToken('frontend')->plainTextToken,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    public function me(Request $request, ProgressService $progress): JsonResponse
    {
        $user = $request->user();
        $progress->ensureInitialSpots($user);
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
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
}
