<?php

namespace Tests\Feature\Api;

use App\Models\Spot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CollectionAndAchievementTest extends TestCase
{
    use RefreshDatabase;

    public function test_collection_summary_returns_unlocked_spots(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $spot = Spot::query()->firstOrFail();
        Sanctum::actingAs($user);

        $this->postJson("/api/spots/{$spot->id}/unlock")->assertCreated();

        $response = $this->getJson('/api/collections');

        $response->assertOk()
            ->assertJsonPath('summary.unlocked_count', 1)
            ->assertJsonPath('summary.total_spots', 14)
            ->assertJsonCount(1, 'data');
    }

    public function test_achievement_list_returns_progress(): void
    {
        $this->seed();

        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/achievements');

        $response->assertOk()
            ->assertJsonCount(4, 'data')
            ->assertJsonStructure([
                'data' => [
                    [
                        'title',
                        'is_earned',
                        'progress' => ['current', 'target'],
                    ],
                ],
            ]);
    }
}
