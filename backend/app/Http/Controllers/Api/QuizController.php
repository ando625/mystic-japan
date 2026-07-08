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

class QuizController extends Controller
{
    public function index(Request $request, Spot $spot, ProgressService $progress): AnonymousResourceCollection
    {
        $user = $request->user() ?? Auth::guard('sanctum')->user();

        if ($user) {
            $progress->ensureInitialSpots($user);
        }

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
        $validated = $request->validate([
            'selected_option' => ['required', 'string', Rule::in(['A', 'B', 'C', 'D'])],
        ]);

        $result = $progress->answerQuiz($request->user(), $quiz->load('spot.stamp'), $validated['selected_option']);
        $spotProgress = $quiz->spot->userSpots()
            ->where('user_id', $request->user()->id)
            ->first();
        $spotStamp = $quiz->spot->stamp;
        $hasStamp = (bool) ($spotStamp && $request->user()->stamps()->whereKey($spotStamp->id)->exists());
        $stamp = $hasStamp ? $spotStamp : $result['stamp'];

        if ($stamp && $hasStamp) {
            $obtainedAt = $request->user()->stamps()
                ->whereKey($stamp->id)
                ->value('user_stamps.obtained_at');
            $stamp->setAttribute('is_obtained', true);
            $stamp->setAttribute('obtained_at', $obtainedAt);
        }

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
        $result = $progress->retrySpotQuizzes($request->user(), $spot->load(['stamp', 'quizzes']));

        return response()->json([
            ...$result,
            'answered_quiz_ids' => [],
        ]);
    }
}
