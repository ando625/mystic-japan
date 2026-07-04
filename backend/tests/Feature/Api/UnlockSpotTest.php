<?php

namespace Tests\Feature\Api;

use App\Models\Spot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UnlockSpotTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_unlock_a_spot_once(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $spot = Spot::query()->where('name', '青い池')->firstOrFail();

        Sanctum::actingAs($user);

        $first = $this->postJson("/api/spots/{$spot->id}/unlock");
        $first->assertCreated()
            ->assertJsonPath('gained_points', 100)
            ->assertJsonPath('already_unlocked', false);

        $second = $this->postJson("/api/spots/{$spot->id}/unlock");
        $second->assertOk()
            ->assertJsonPath('gained_points', 0)
            ->assertJsonPath('already_unlocked', true);

        $this->assertDatabaseCount('collections', 1);
    }

    public function test_unlocking_spots_can_grant_achievements(): void
    {
        $this->seed();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Spot::query()
            ->where('category', Spot::CATEGORY_SHRINE_TEMPLE)
            ->limit(3)
            ->get()
            ->each(fn (Spot $spot) => $this->postJson("/api/spots/{$spot->id}/unlock")->assertSuccessful());

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $user->id,
        ]);
    }
}
