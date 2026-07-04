<?php

namespace App\Services;

use App\Models\Spot;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Support\Arr;
use RuntimeException;

class AiGuideService
{
    public function __construct(private readonly HttpFactory $http) {}

    public function answer(Spot $spot, string $message): string
    {
        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model', 'gemini-2.5-flash');

        if (! $apiKey) {
            throw new RuntimeException('GEMINI_API_KEY is not configured.');
        }

        $response = $this->http
            ->timeout(20)
            ->retry(2, 300)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $this->buildPrompt($spot, $message)],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.75,
                    'topP' => 0.9,
                    'maxOutputTokens' => 900,
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Gemini API request failed.');
        }

        $answer = Arr::get($response->json(), 'candidates.0.content.parts.0.text');

        if (! is_string($answer) || trim($answer) === '') {
            throw new RuntimeException('Gemini API returned an empty answer.');
        }

        return trim($answer);
    }

    private function buildPrompt(Spot $spot, string $message): string
    {
        // Keep the guide grounded in the DB record so answers match the selected spot.
        return <<<PROMPT
あなたはWebアプリ「日本神秘紀行 ～神々の記憶を巡る旅～」のAI旅ガイドです。
口調は落ち着いた幻想的な案内人です。旅行サイトの事務的な説明ではなく、和風ファンタジーRPGの図鑑ガイドとして答えてください。

制約:
- 日本語で答える
- 事実と伝承を混同しすぎない
- 危険な行動や立入禁止をすすめない
- 回答は3〜6文程度
- 必要に応じて、季節・見どころ・神話的な楽しみ方を短く添える

スポット情報:
名前: {$spot->name}
地域: {$spot->region}
都道府県: {$spot->prefecture}
カテゴリ: {$spot->category}
説明: {$spot->description}
神話・伝説: {$spot->mythology}
歴史: {$spot->history}
豆知識: {$spot->trivia}
レア度: {$spot->rarity}
神秘ポイント: {$spot->mystic_points}

ユーザーの質問:
{$message}
PROMPT;
    }
}
