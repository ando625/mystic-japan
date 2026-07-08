<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\Spot;
use App\Models\Stamp;
use App\Models\User;
use App\Models\UserSpot;
use App\Models\UserStamp;

class ProgressService
{
    private const STAMP_REQUIRED_CORRECT_ANSWERS = 3;

    public function __construct(private readonly AchievementService $achievements) {}

    public function ensureInitialSpots(User $user): void
    {
        Spot::query()
            ->where('is_initially_unlocked', true)
            ->each(fn (Spot $spot) => $this->unlockSpot($user, $spot, false));
    }

    /**
     * Unlocks a spot in the new user_spots table and mirrors it to collections
     * so existing collection and achievement screens keep working.
     *
     * @return array{progress: UserSpot, already_unlocked: bool, gained_points: int, new_achievements: mixed}
     */
    public function unlockSpot(User $user, Spot $spot, bool $grantPoints = true): array
    {
        $progress = UserSpot::query()->firstOrNew([
            'user_id' => $user->id,
            'spot_id' => $spot->id,
        ]);

        $alreadyUnlocked = (bool) $progress->is_unlocked;

        if (! $alreadyUnlocked) {
            $progress->fill([
                'is_unlocked' => true,
                'unlocked_at' => now(),
            ])->save();
        }

        $collection = Collection::query()->firstOrCreate(
            ['user_id' => $user->id, 'spot_id' => $spot->id],
            ['unlocked_at' => $progress->unlocked_at ?? now()],
        );

        if (! $collection->unlocked_at) {
            $collection->unlocked_at = $progress->unlocked_at ?? now();
            $collection->save();
        }

        $newAchievements = $alreadyUnlocked ? collect() : $this->achievements->grantUnlockedAchievements($user);

        return [
            'progress' => $progress,
            'already_unlocked' => $alreadyUnlocked,
            'gained_points' => $alreadyUnlocked || ! $grantPoints ? 0 : $spot->mystic_points,
            'new_achievements' => $newAchievements,
        ];
    }

    /**
     * @return array{progress: UserSpot, stamp: Stamp|null, stamp_obtained: bool}
     */
    public function visitSpot(User $user, Spot $spot): array
    {
        $progress = UserSpot::query()->firstOrCreate([
            'user_id' => $user->id,
            'spot_id' => $spot->id,
        ]);

        if (! $progress->visited_at) {
            $progress->visited_at = now();
            $progress->save();
        }

        return [
            'progress' => $progress,
            'stamp' => null,
            'stamp_obtained' => false,
        ];
    }

    /**
     * @return array{stamp: Stamp, already_obtained: bool}
     */
    public function obtainStamp(User $user, Stamp $stamp): array
    {
        $userStamp = UserStamp::query()->firstOrCreate(
            ['user_id' => $user->id, 'stamp_id' => $stamp->id],
            ['obtained_at' => now()],
        );

        return [
            'stamp' => $stamp,
            'already_obtained' => ! $userStamp->wasRecentlyCreated,
        ];
    }

    /**
     * @return array{answer: QuizAnswer, is_correct: bool, already_answered: bool, reward_points: int, stamp: Stamp|null, stamp_obtained: bool, spot_unlocked: bool, correct_answers_count: int, required_correct_answers: int}
     */
    public function answerQuiz(User $user, Quiz $quiz, string $selectedOption): array
    {
        $existing = QuizAnswer::query()
            ->where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->first();

        if ($existing) {
            $reward = $this->grantSpotQuizCompletionReward($user, $quiz);

            return [
                'answer' => $existing,
                'is_correct' => $existing->is_correct,
                'already_answered' => true,
                'reward_points' => 0,
                'stamp' => $reward['stamp'],
                'stamp_obtained' => $reward['stamp_obtained'],
                'spot_unlocked' => $reward['spot_unlocked'],
                'correct_answers_count' => $reward['correct_answers_count'],
                'required_correct_answers' => self::STAMP_REQUIRED_CORRECT_ANSWERS,
            ];
        }

        $isCorrect = strtoupper($selectedOption) === $quiz->correct_option;
        $answer = QuizAnswer::query()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'selected_option' => strtoupper($selectedOption),
            'is_correct' => $isCorrect,
            'answered_at' => now(),
        ]);

        $reward = $this->grantSpotQuizCompletionReward($user, $quiz);

        return [
            'answer' => $answer,
            'is_correct' => $isCorrect,
            'already_answered' => false,
            'reward_points' => $isCorrect ? $quiz->reward_points : 0,
            'stamp' => $reward['stamp'],
            'stamp_obtained' => $reward['stamp_obtained'],
            'spot_unlocked' => $reward['spot_unlocked'],
            'correct_answers_count' => $reward['correct_answers_count'],
            'required_correct_answers' => self::STAMP_REQUIRED_CORRECT_ANSWERS,
        ];
    }

    /**
     * @return array{stamp: Stamp|null, stamp_obtained: bool, spot_unlocked: bool, correct_answers_count: int}
     */
    private function grantSpotQuizCompletionReward(User $user, Quiz $quiz): array
    {
        $correctAnswersCount = $this->correctAnswersCountForSpot($user, $quiz->spot);
        $stampResult = null;
        $spotUnlock = ['already_unlocked' => true];

        if ($correctAnswersCount >= self::STAMP_REQUIRED_CORRECT_ANSWERS) {
            $spotUnlock = $this->unlockSpot($user, $quiz->spot);
            $this->markVisited($spotUnlock['progress']);
            $stampResult = $quiz->spot->stamp ? $this->obtainStamp($user, $quiz->spot->stamp) : null;
        }

        return [
            'stamp' => $stampResult['stamp'] ?? null,
            'stamp_obtained' => $stampResult ? ! $stampResult['already_obtained'] : false,
            'spot_unlocked' => ! $spotUnlock['already_unlocked'],
            'correct_answers_count' => $correctAnswersCount,
        ];
    }

    private function correctAnswersCountForSpot(User $user, Spot $spot): int
    {
        return $user->quizAnswers()
            ->where('is_correct', true)
            ->whereHas('quiz', fn ($query) => $query->where('spot_id', $spot->id))
            ->count();
    }

    /**
     * @return array{can_retry: bool, deleted_answers: int, correct_answers_count: int, required_correct_answers: int}
     */
    public function retrySpotQuizzes(User $user, Spot $spot): array
    {
        $correctAnswersCount = $this->correctAnswersCountForSpot($user, $spot);
        $hasStamp = (bool) ($spot->stamp && $user->stamps()->whereKey($spot->stamp->id)->exists());

        if ($hasStamp || $correctAnswersCount >= self::STAMP_REQUIRED_CORRECT_ANSWERS) {
            return [
                'can_retry' => false,
                'deleted_answers' => 0,
                'correct_answers_count' => $correctAnswersCount,
                'required_correct_answers' => self::STAMP_REQUIRED_CORRECT_ANSWERS,
            ];
        }

        $quizIds = $spot->quizzes()->pluck('id');
        $deletedAnswers = QuizAnswer::query()
            ->where('user_id', $user->id)
            ->whereIn('quiz_id', $quizIds)
            ->delete();

        return [
            'can_retry' => true,
            'deleted_answers' => $deletedAnswers,
            'correct_answers_count' => 0,
            'required_correct_answers' => self::STAMP_REQUIRED_CORRECT_ANSWERS,
        ];
    }

    private function markVisited(UserSpot $progress): void
    {
        if ($progress->visited_at) {
            return;
        }

        $progress->visited_at = now();
        $progress->save();
    }

    public function totalPoints(User $user): int
    {
        $spotPoints = (int) $user->collections()
            ->join('spots', 'collections.spot_id', '=', 'spots.id')
            ->sum('spots.mystic_points');

        $quizPoints = (int) $user->quizAnswers()
            ->where('is_correct', true)
            ->join('quizzes', 'quiz_answers.quiz_id', '=', 'quizzes.id')
            ->sum('quizzes.reward_points');

        return $spotPoints + $quizPoints;
    }
}
