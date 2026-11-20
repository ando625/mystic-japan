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
            'services.gemini.model' => 'gemini-3.5-flash-lite',
        ]);

        $spot = Spot::query()->where('name', '青い池')->firstOrFail();
        Sanctum::actingAs(User::factory()->create());

        Http::fake([
            // Interactions API の返事の形（考えた過程の step のあとに、文の入った model_output の step が来る）
            'generativelanguage.googleapis.com/*' => Http::response([
                'status' => 'completed',
                'steps' => [
                    ['type' => 'thought', 'content' => []],
                    [
                        'type' => 'model_output',
                        'content' => [
                            ['type' => 'text', 'text' => '冬の青い池は、雪と青い水面が静かに響き合う神秘的な景色です。'],
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
            ->assertJsonPath('model', 'gemini-3.5-flash-lite')
            ->assertJsonStructure(['answer']);

        Http::assertSent(function ($request) {
            $payload = $request->data();
            $prompt = $payload['input'] ?? '';

            // キーは URL ではなくヘッダーで送り、新しい窓口（interactions）を呼びます。
            return $request->url() === 'https://generativelanguage.googleapis.com/v1beta/interactions'
                && $request->hasHeader('x-goog-api-key', 'test-key')
                && ! str_contains($request->url(), 'test-key')
                && ($payload['model'] ?? null) === 'gemini-3.5-flash-lite'
                && str_contains($prompt, '青い池')
                && str_contains($prompt, '神話・伝説')
                && str_contains($prompt, '冬でも綺麗？');
        });
    }

    public function test_ai_guide_returns_service_unavailable_when_gemini_returns_error(): void
    {
        // Gemini がエラー（例: 廃止されたモデルの 404）を返しても、500 ではなく 503 と決まった文を返します。
        $this->seed();
        config(['services.gemini.api_key' => 'test-key']);

        $spot = Spot::query()->firstOrFail();
        Sanctum::actingAs(User::factory()->create());

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response(['error' => ['code' => 404, 'status' => 'NOT_FOUND']], 404),
        ]);

        $response = $this->postJson('/api/ai/guide', [
            'spot_id' => $spot->id,
            'message' => 'おすすめの時間帯は？',
        ]);

        $response->assertStatus(503)
            ->assertJsonPath('message', 'AI旅ガイドの応答を生成できませんでした。');
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
