<?php

namespace Tests\Feature\Api;

use App\Models\Spot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiGuideTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_ask_ai_guide_with_spot_context(): void
    {
        $this->seed();
        config([
            'services.gemini.api_key' => 'test-key',
            'services.gemini.model' => 'gemini-2.5-flash',
        ]);

        $spot = Spot::query()->where('name', '青い池')->firstOrFail();
        Sanctum::actingAs(User::factory()->create());

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => '冬の青い池は、雪と青い水面が静かに響き合う神秘的な景色です。'],
                            ],
                        ],
                    ],
                ],
            ]),
        ]);

        $response = $this->postJson('/api/ai/guide', [
            'spot_id' => $spot->id,
            'message' => '冬でも綺麗？',
        ]);

        $response->assertOk()
            ->assertJsonPath('spot_id', $spot->id)
            ->assertJsonPath('model', 'gemini-2.5-flash')
            ->assertJsonStructure(['answer']);

        Http::assertSent(function ($request) {
            $payload = $request->data();
            $prompt = $payload['contents'][0]['parts'][0]['text'] ?? '';

            return str_contains($request->url(), 'gemini-2.5-flash:generateContent')
                && str_contains($prompt, '青い池')
                && str_contains($prompt, '神話・伝説')
                && str_contains($prompt, '冬でも綺麗？');
        });
    }

    public function test_ai_guide_returns_service_unavailable_without_api_key(): void
    {
        $this->seed();
        config(['services.gemini.api_key' => null]);

        $spot = Spot::query()->firstOrFail();
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/ai/guide', [
            'spot_id' => $spot->id,
            'message' => 'おすすめの時間帯は？',
        ]);

        $response->assertStatus(503)
            ->assertJsonPath('message', 'AI旅ガイドの応答を生成できませんでした。');
    }
}
