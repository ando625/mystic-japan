<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Spot;
use App\Services\AiGuideService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

// スポット情報を文脈にして、Gemini APIへ質問するAI旅ガイドControllerです。
class AiGuideController extends Controller
{
    // Next.jsから届いた質問を検証し、対象スポットの情報と一緒にAIへ渡します。
    public function __invoke(Request $request, AiGuideService $aiGuide): JsonResponse
    {
        // spot_idは存在するスポットだけ、messageは長すぎない文字列だけ受け付けます。
        $validated = $request->validate([
            'spot_id' => ['required', 'integer', 'exists:spots,id'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        // AIへ渡すプロンプトに神話・歴史・豆知識を含めるため、DBからスポットを取得します。
        $spot = Spot::query()->findOrFail($validated['spot_id']);

        try {
            // 実際のGemini API呼び出しはServiceへ分け、Controllerは入出力に集中させています。
            $answer = $aiGuide->answer($spot, $validated['message']);
        } catch (RuntimeException $exception) {
            report($exception);

            return response()->json([
                'message' => 'AI旅ガイドの応答を生成できませんでした。',
            ], 503);
        }

        // フロント側で表示しやすいよう、回答本文・対象スポット・利用モデルを返します。
        return response()->json([
            'answer' => $answer,
            'spot_id' => $spot->id,
            'model' => config('services.gemini.model', 'gemini-2.5-flash'),
        ]);
    }
}
