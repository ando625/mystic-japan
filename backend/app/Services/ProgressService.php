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
     * Marks a spot as visited. Visiting is treated as "clearing" the spot and
     * grants the linked goshuin stamp once.
     *
     * @return array{progress: UserSpot, stamp: Stamp|null, stamp_obtained: bool}
     */
    public function visitSpot(User $user, Spot $spot): array
    {
        $unlock = $this->unlockSpot($user, $spot);
        $progress = $unlock['progress'];

        if (! $progress->visited_at) {
            $progress->visited_at = now();
            $progress->save();
        }

        $stampResult = $spot->stamp ? $this->obtainStamp($user, $spot->stamp) : null;

        return [
            'progress' => $progress,
            'stamp' => $stampResult['stamp'] ?? null,
            'stamp_obtained' => $stampResult ? ! $stampResult['already_obtained'] : false,
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
     * @return array{answer: QuizAnswer, is_correct: bool, already_answered: bool, reward_points: int, stamp: Stamp|null, stamp_obtained: bool, spot_unlocked: bool}
     */
    public function answerQuiz(User $user, Quiz $quiz, string $selectedOption): array
    {
        $existing = QuizAnswer::query()
            ->where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->first();

        if ($existing) {
            $stampResult = null;
            $spotUnlock = ['already_unlocked' => true];

            // Older sessions may have a correct answer saved before unlock and
            // stamp rewards were fully wired. Repair that progression here
            // without granting duplicate quiz points.
            if ($existing->is_correct) {
                $spotUnlock = $this->unlockSpot($user, $quiz->spot);
                $this->markVisited($spotUnlock['progress']);
                $stampResult = $quiz->spot->stamp ? $this->obtainStamp($user, $quiz->spot->stamp) : null;
            }

            return [
                'answer' => $existing,
                'is_correct' => $existing->is_correct,
                'already_answered' => true,
                'reward_points' => 0,
                'stamp' => $stampResult['stamp'] ?? null,
                'stamp_obtained' => $stampResult ? ! $stampResult['already_obtained'] : false,
                'spot_unlocked' => $existing->is_correct && ! $spotUnlock['already_unlocked'],
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

        $stampResult = null;
        $spotUnlock = ['already_unlocked' => true];

        if ($isCorrect) {
            $spotUnlock = $this->unlockSpot($user, $quiz->spot);
            $this->markVisited($spotUnlock['progress']);
            $stampResult = $quiz->spot->stamp ? $this->obtainStamp($user, $quiz->spot->stamp) : null;
        }

        return [
            'answer' => $answer,
            'is_correct' => $isCorrect,
            'already_answered' => false,
            'reward_points' => $isCorrect ? $quiz->reward_points : 0,
            'stamp' => $stampResult['stamp'] ?? null,
            'stamp_obtained' => $stampResult ? ! $stampResult['already_obtained'] : false,
            'spot_unlocked' => $isCorrect && ! $spotUnlock['already_unlocked'],
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
