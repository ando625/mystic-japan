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
use Illuminate\Validation\Rule;

class QuizController extends Controller
{
    public function index(Request $request, Spot $spot, ProgressService $progress): AnonymousResourceCollection
    {
        $user = $request->user();

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
        $stamp = $result['stamp'];

        if ($stamp) {
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
            'stamp_obtained' => $result['stamp_obtained'],
            'stamp' => $stamp ? new StampResource($stamp->load('spot')) : null,
            'spot_unlocked' => $result['spot_unlocked'],
            'visited' => (bool) $quiz->spot->userSpots()
                ->where('user_id', $request->user()->id)
                ->whereNotNull('visited_at')
                ->exists(),
            'user_progress' => [
                'is_unlocked' => (bool) $spotProgress?->is_unlocked,
                'visited_at' => $spotProgress?->visited_at ? Carbon::parse($spotProgress->visited_at)->toISOString() : null,
                'stamp_obtained' => $result['stamp_obtained'] || (bool) ($stamp && $request->user()->stamps()->whereKey($stamp->id)->exists()),
                'total_points' => $progress->totalPoints($request->user()),
            ],
        ], $result['already_answered'] ? 200 : 201);
    }
}
