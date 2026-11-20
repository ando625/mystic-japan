<?php

namespace Tests\Feature\Api;

use App\Models\Spot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

// AI旅ガイドの回数制限のテストです。
// 誰でも登録できるため、1人あたりと全体の回数を制限して、Gemini APIの無料枠を使い切られないようにします。
class AiGuideRateLimitTest extends TestCase
{
    use RefreshDatabase;

    private Spot $spot;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
        config(['services.gemini.api_key' => 'test-key']);
        $this->spot = Spot::query()->firstOrFail();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [['content' => ['parts' => [['text' => 'テスト用の回答です。']]]]],
            ]),
        ]);
    }

    private function ask(User $user): \Illuminate\Testing\TestResponse
    {
        Sanctum::actingAs($user);

        return $this->postJson('/api/ai/guide', [
            'spot_id' => $this->spot->id,
            'message' => 'おすすめの時間帯は？',
        ]);
    }

    public function test_one_user_is_limited_per_minute(): void
    {
        config(['services.gemini.guide_per_minute' => 2]);
        $user = User::factory()->create();

        $this->ask($user)->assertOk();
        $this->ask($user)->assertOk();
        $this->ask($user)
            ->assertStatus(429)
            ->assertJsonPath('message', 'AI旅ガイドへの質問が多すぎます。少し時間をおいてからお試しください。');

        // 制限を超えた分は、Gemini APIへ送らない。
        Http::assertSentCount(2);
    }

    public function test_limit_is_counted_per_user(): void
    {
        config(['services.gemini.guide_per_minute' => 1]);

        $this->ask(User::factory()->create())->assertOk();
        $this->ask(User::factory()->create())->assertOk();
    }

    public function test_one_user_is_limited_per_day(): void
    {
        config([
            'services.gemini.guide_per_minute' => 100,
            'services.gemini.guide_per_user_per_day' => 2,
        ]);
        $user = User::factory()->create();

        $this->ask($user)->assertOk();
        $this->ask($user)->assertOk();
        $this->ask($user)->assertStatus(429);
    }

    public function test_all_users_together_are_limited_per_day(): void
    {
        config([
            'services.gemini.guide_per_minute' => 100,
            'services.gemini.guide_total_per_day' => 2,
        ]);

        $this->ask(User::factory()->create())->assertOk();
        $this->ask(User::factory()->create())->assertOk();
        $this->ask(User::factory()->create())->assertStatus(429);
    }
}
