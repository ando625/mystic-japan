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

    public function test_user_can_visit_spot_and_obtain_stamp_once(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $spot = Spot::query()->with('stamp')->firstOrFail();
        Sanctum::actingAs($user);

        $first = $this->postJson("/api/spots/{$spot->id}/visit");
        $second = $this->postJson("/api/spots/{$spot->id}/visit");

        $first->assertOk()
            ->assertJsonPath('stamp_obtained', true)
            ->assertJsonPath('stamp.id', $spot->stamp->id);

        $second->assertOk()
            ->assertJsonPath('stamp_obtained', true)
            ->assertJsonPath('user_progress.stamp_obtained', true);

        $this->assertDatabaseCount('user_stamps', 1);
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

        $this->assertDatabaseCount('quiz_answers', 3);
        $this->assertDatabaseHas('user_stamps', [
            'user_id' => $user->id,
            'stamp_id' => $spot->stamp->id,
        ]);
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

    public function test_my_stamps_reflects_stamp_obtained_from_visit(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $spot = Spot::query()->with('stamp')->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson("/api/spots/{$spot->id}/visit")
            ->assertOk()
            ->assertJsonPath('stamp.id', $spot->stamp->id);

        $this->getJson('/api/me/stamps')
            ->assertOk()
            ->assertJsonPath('data.0.id', $spot->stamp->id)
            ->assertJsonPath('data.0.is_obtained', true)
            ->assertJsonPath('data.0.obtained_at', fn ($value) => is_string($value));
    }
}
