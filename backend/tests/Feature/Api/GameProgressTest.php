<?php

namespace Tests\Feature\Api;

use App\Models\Quiz;
use App\Models\Spot;
use App\Models\Stamp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GameProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_visit_spot_does_not_obtain_stamp(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $spot = Spot::query()->with('stamp')->firstOrFail();
        Sanctum::actingAs($user);

        $first = $this->postJson("/api/spots/{$spot->id}/visit");
        $second = $this->postJson("/api/spots/{$spot->id}/visit");

        $first->assertOk()
            ->assertJsonPath('stamp_obtained', false)
            ->assertJsonPath('stamp', null);

        $second->assertOk()
            ->assertJsonPath('stamp_obtained', false)
            ->assertJsonPath('user_progress.stamp_obtained', false);

        $this->assertDatabaseCount('user_stamps', 0);
    }

    public function test_three_correct_quiz_answers_grant_stamp_once(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $spot = Spot::query()->with('stamp')->has('quizzes', '>=', 3)->firstOrFail();
        $quizzes = $spot->quizzes()->orderBy('id')->take(3)->get();
        Sanctum::actingAs($user);

        $first = $this->postJson("/api/quizzes/{$quizzes[0]->id}/answer", [
            'selected_option' => $quizzes[0]->correct_option,
        ]);
        $second = $this->postJson("/api/quizzes/{$quizzes[1]->id}/answer", [
            'selected_option' => $quizzes[1]->correct_option,
        ]);
        $third = $this->postJson("/api/quizzes/{$quizzes[2]->id}/answer", [
            'selected_option' => $quizzes[2]->correct_option,
        ]);
        $duplicate = $this->postJson("/api/quizzes/{$quizzes[2]->id}/answer", [
            'selected_option' => $quizzes[2]->correct_option,
        ]);

        $first->assertCreated()
            ->assertJsonPath('is_correct', true)
            ->assertJsonPath('reward_points', $quizzes[0]->reward_points)
            ->assertJsonPath('correct_answers_count', 1)
            ->assertJsonPath('stamp_obtained', false);

        $second->assertCreated()
            ->assertJsonPath('is_correct', true)
            ->assertJsonPath('correct_answers_count', 2)
            ->assertJsonPath('stamp_obtained', false);

        $third->assertCreated()
            ->assertJsonPath('is_correct', true)
            ->assertJsonPath('correct_answers_count', 3)
            ->assertJsonPath('stamp_obtained', true)
            ->assertJsonPath('stamp_newly_obtained', true)
            ->assertJsonPath('user_progress.stamp_obtained', true);

        $duplicate->assertOk()
            ->assertJsonPath('already_answered', true)
            ->assertJsonPath('reward_points', 0)
            ->assertJsonPath('stamp_obtained', true)
            ->assertJsonPath('user_progress.stamp_obtained', true);

        $this->postJson("/api/spots/{$spot->id}/quizzes/retry")
            ->assertOk()
            ->assertJsonPath('can_retry', false)
            ->assertJsonPath('deleted_answers', 0);

        $this->assertDatabaseCount('quiz_answers', 3);
        $this->assertDatabaseHas('user_stamps', [
            'user_id' => $user->id,
            'stamp_id' => $spot->stamp->id,
        ]);
    }

    public function test_user_can_retry_spot_quizzes_until_stamp_is_obtained(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $spot = Spot::query()->with('stamp')->has('quizzes', '>=', 4)->firstOrFail();
        $quizzes = $spot->quizzes()->orderBy('id')->take(4)->get();
        Sanctum::actingAs($user);

        $this->postJson("/api/quizzes/{$quizzes[0]->id}/answer", [
            'selected_option' => $quizzes[0]->correct_option,
        ])->assertCreated();
        $this->postJson("/api/quizzes/{$quizzes[1]->id}/answer", [
            'selected_option' => $quizzes[1]->correct_option,
        ])->assertCreated();
        $this->postJson("/api/quizzes/{$quizzes[2]->id}/answer", [
            'selected_option' => $this->wrongOption($quizzes[2]),
        ])->assertCreated();
        $this->postJson("/api/quizzes/{$quizzes[3]->id}/answer", [
            'selected_option' => $this->wrongOption($quizzes[3]),
        ])->assertCreated()
            ->assertJsonPath('correct_answers_count', 2)
            ->assertJsonPath('stamp_obtained', false);

        $this->assertDatabaseCount('quiz_answers', 4);
        $this->assertDatabaseCount('user_stamps', 0);

        $this->postJson("/api/spots/{$spot->id}/quizzes/retry")
            ->assertOk()
            ->assertJsonPath('can_retry', true)
            ->assertJsonPath('deleted_answers', 4)
            ->assertJsonPath('correct_answers_count', 0);

        $this->assertDatabaseCount('quiz_answers', 0);
        $this->assertDatabaseCount('user_stamps', 0);
    }

    public function test_stamp_index_marks_obtained_state(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $stamp = Stamp::query()->firstOrFail();
        $user->stamps()->attach($stamp->id, ['obtained_at' => now()]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/stamps');

        $response->assertOk()
            ->assertJsonPath('data.0.is_obtained', true);
    }

    public function test_my_stamps_reflects_stamp_obtained_from_quiz_completion(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $spot = Spot::query()->with('stamp')->has('quizzes', '>=', 3)->firstOrFail();
        $quizzes = $spot->quizzes()->orderBy('id')->take(3)->get();
        Sanctum::actingAs($user);

        foreach ($quizzes as $quiz) {
            $this->postJson("/api/quizzes/{$quiz->id}/answer", [
                'selected_option' => $quiz->correct_option,
            ])->assertCreated();
        }

        $this->getJson('/api/me/stamps')
            ->assertOk()
            ->assertJsonPath('data.0.id', $spot->stamp->id)
            ->assertJsonPath('data.0.is_obtained', true)
            ->assertJsonPath('data.0.obtained_at', fn ($value) => is_string($value));
    }

    private function wrongOption(Quiz $quiz): string
    {
        return collect(['A', 'B', 'C', 'D'])
            ->first(fn (string $option): bool => $option !== $quiz->correct_option) ?? 'A';
    }
}
