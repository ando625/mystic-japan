<?php

namespace Tests\Feature\Api;

use App\Models\Spot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpotApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_spot_index_returns_seeded_mvp_spots(): void
    {
        $this->seed();

        $response = $this->getJson('/api/spots');

        $response->assertOk()
            ->assertJsonCount(14, 'data')
            ->assertJsonPath('data.0.name', '青い池')
            ->assertJsonPath('data.0.is_unlocked', false);
    }

    public function test_spot_detail_includes_lore_and_media_urls(): void
    {
        $this->seed();
        $spot = Spot::query()->where('name', '那智の滝')->firstOrFail();

        $response = $this->getJson("/api/spots/{$spot->id}");

        $response->assertOk()
            ->assertJsonPath('data.name', '那智の滝')
            ->assertJsonStructure([
                'data' => [
                    'mythology',
                    'history',
                    'trivia',
                    'music_url',
                    'video_url',
                ],
            ]);
    }
}
