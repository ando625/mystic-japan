<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StampResource;
use App\Models\Stamp;
use App\Services\ProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StampController extends Controller
{
    public function index(Request $request, ProgressService $progress): AnonymousResourceCollection
    {
        $user = $request->user();

        if ($user) {
            $progress->ensureInitialSpots($user);
        }

        $obtained = $user
            ? $user->stamps()->pluck('user_stamps.obtained_at', 'stamps.id')
            : collect();

        $stamps = Stamp::query()
            ->with('spot')
            ->orderBy('id')
            ->get();

        $stamps->each(function (Stamp $stamp) use ($obtained): void {
            $stamp->setAttribute('is_obtained', $obtained->has($stamp->id));
            $stamp->setAttribute('obtained_at', $obtained[$stamp->id] ?? null);
        });

        return StampResource::collection($stamps);
    }

    public function mine(Request $request, ProgressService $progress): AnonymousResourceCollection
    {
        $progress->ensureInitialSpots($request->user());

        return $this->index($request, $progress);
    }

    public function obtain(Request $request, Stamp $stamp, ProgressService $progress): JsonResponse
    {
        $result = $progress->obtainStamp($request->user(), $stamp);

        return response()->json([
            'stamp' => new StampResource($result['stamp']->load('spot')),
            'already_obtained' => $result['already_obtained'],
        ], $result['already_obtained'] ? 200 : 201);
    }
}
