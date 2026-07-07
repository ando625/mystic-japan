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

    public function test_correct_quiz_answer_grants_reward_and_stamp_once(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $quiz = Quiz::query()->with('spot.stamp')->firstOrFail();
        Sanctum::actingAs($user);

        $first = $this->postJson("/api/quizzes/{$quiz->id}/answer", [
            'selected_option' => $quiz->correct_option,
        ]);
        $second = $this->postJson("/api/quizzes/{$quiz->id}/answer", [
            'selected_option' => $quiz->correct_option,
        ]);

        $first->assertCreated()
            ->assertJsonPath('is_correct', true)
            ->assertJsonPath('reward_points', $quiz->reward_points)
            ->assertJsonPath('stamp_obtained', true);

        $second->assertOk()
            ->assertJsonPath('already_answered', true)
            ->assertJsonPath('reward_points', 0)
            ->assertJsonPath('stamp_obtained', true)
            ->assertJsonPath('user_progress.stamp_obtained', true);

        $this->assertDatabaseCount('quiz_answers', 1);
        $this->assertDatabaseHas('user_stamps', [
            'user_id' => $user->id,
            'stamp_id' => $quiz->spot->stamp->id,
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
