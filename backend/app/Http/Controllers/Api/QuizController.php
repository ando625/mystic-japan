<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuizResource;
use App\Http\Resources\StampResource;
use App\Models\Quiz;
use App\Models\Spot;
use App\Services\ProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

// 神話クイズの一覧取得、回答、再挑戦リセットを扱うControllerです。
class QuizController extends Controller
{
    // クイズ画面で使う問題一覧を返し、ログイン済みなら回答済み状態も付けます。
    public function index(Request $request, Spot $spot, ProgressService $progress): AnonymousResourceCollection
    {
        $user = $request->user() ?? Auth::guard('sanctum')->user();

        if ($user) {
            // ログイン済みなら、初期解放スポットを先に進行状態へ反映します。
            $progress->ensureInitialSpots($user);
        }

        // 取得したクイズにユーザーの回答状態を後から付与して、画面で回答済み表示できるようにします。
        $answerMap = $user
            ? $user->quizAnswers()->whereIn('quiz_id', $spot->quizzes()->pluck('id'))->get()->keyBy('quiz_id')
            : collect();

        $quizzes = $spot->quizzes()->orderBy('id')->get();

        $quizzes->each(function (Quiz $quiz) use ($answerMap): void {
            $answer = $answerMap->get($quiz->id);
            $quiz->setAttribute('answered_at', $answer?->answered_at);
            $quiz->setAttribute('selected_option', $answer?->selected_option);
            $quiz->setAttribute('is_correct', $answer?->is_correct);
        });

        return QuizResource::collection($quizzes);
    }

    public function answer(Request $request, Quiz $quiz, ProgressService $progress): JsonResponse
    {
        // 選択肢はA-Dだけを受け付け、想定外の値で採点されないようにします。
        $validated = $request->validate([
            'selected_option' => ['required', 'string', Rule::in(['A', 'B', 'C', 'D'])],
        ]);

        // 採点・正解数判定・御朱印獲得・スポット解放はServiceへ集約します。
        $result = $progress->answerQuiz($request->user(), $quiz->load('spot.stamp'), $validated['selected_option']);

        // 回答後のスポット進行状態をレスポンスに含めるため、user_spotsから最新状態を取得します。
        $spotProgress = $quiz->spot->userSpots()
            ->where('user_id', $request->user()->id)
            ->first();
        $spotStamp = $quiz->spot->stamp;

        // 御朱印が既にあるかどうかは、user_stampsの存在で判定します。
        $hasStamp = (bool) ($spotStamp && $request->user()->stamps()->whereKey($spotStamp->id)->exists());

        // 新規獲得ならService結果のstamp、既に獲得済みならスポットのstampを使います。
        $stamp = $hasStamp ? $spotStamp : $result['stamp'];

        if ($stamp && $hasStamp) {
            // 御朱印帳と同じ表示になるよう、獲得日時をResourceへ渡します。
            $obtainedAt = $request->user()->stamps()
                ->whereKey($stamp->id)
                ->value('user_stamps.obtained_at');
            $stamp->setAttribute('is_obtained', true);
            $stamp->setAttribute('obtained_at', $obtainedAt);
        }

        // ここで返した値をフロントが受け取り、画面を即時更新します。
        return response()->json([
            'quiz_id' => $quiz->id,
            'selected_option' => $result['answer']->selected_option,
            'correct_option' => $quiz->correct_option,
            'is_correct' => $result['is_correct'],
            'already_answered' => $result['already_answered'],
            'reward_points' => $result['reward_points'],
            'explanation' => $quiz->explanation,
            'stamp_obtained' => $hasStamp,
            'stamp_newly_obtained' => $result['stamp_obtained'],
            'stamp' => $stamp ? new StampResource($stamp->load('spot')) : null,
            'spot_unlocked' => $result['spot_unlocked'],
            'correct_answers_count' => $result['correct_answers_count'],
            'required_correct_answers' => $result['required_correct_answers'],
            'visited' => (bool) $quiz->spot->userSpots()
                ->where('user_id', $request->user()->id)
                ->whereNotNull('visited_at')
                ->exists(),
            'user_progress' => [
                // 詳細画面・図鑑・御朱印帳で同じ状態を見せるため、進行状態をまとめて返します。
                'is_unlocked' => (bool) $spotProgress?->is_unlocked,
                'unlocked_at' => $spotProgress?->unlocked_at ? Carbon::parse($spotProgress->unlocked_at)->toISOString() : null,
                'visited_at' => $spotProgress?->visited_at ? Carbon::parse($spotProgress->visited_at)->toISOString() : null,
                'stamp_obtained' => $hasStamp,
                'total_points' => $progress->totalPoints($request->user()),
                'answered_quiz_ids' => $request->user()->quizAnswers()
                    ->whereHas('quiz', fn ($query) => $query->where('spot_id', $quiz->spot_id))
                    ->pluck('quiz_id')
                    ->values()
                    ->all(),
            ],
        ], $result['already_answered'] ? 200 : 201);
    }

    public function retry(Request $request, Spot $spot, ProgressService $progress): JsonResponse
    {
        // 御朱印未獲得かつ3問未満だった場合のみ、回答履歴を消して再挑戦できるようにします。
        $result = $progress->retrySpotQuizzes($request->user(), $spot->load(['stamp', 'quizzes']));

        return response()->json([
            ...$result,
            'answered_quiz_ids' => [],
        ]);
    }
}
