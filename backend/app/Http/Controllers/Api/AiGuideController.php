<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Spot;
use App\Services\AiGuideService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class AiGuideController extends Controller
{
    public function __invoke(Request $request, AiGuideService $aiGuide): JsonResponse
    {
        $validated = $request->validate([
            'spot_id' => ['required', 'integer', 'exists:spots,id'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $spot = Spot::query()->findOrFail($validated['spot_id']);

        try {
            $answer = $aiGuide->answer($spot, $validated['message']);
        } catch (RuntimeException $exception) {
            report($exception);

            return response()->json([
                'message' => 'AI旅ガイドの応答を生成できませんでした。',
            ], 503);
        }

        return response()->json([
            'answer' => $answer,
            'spot_id' => $spot->id,
            'model' => config('services.gemini.model', 'gemini-2.5-flash'),
        ]);
    }
}
