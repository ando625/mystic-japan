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
        $model = config('services.gemini.model', 'gemini-3.5-flash-lite');

        if (! $apiKey) {
            throw new RuntimeException('GEMINI_API_KEY is not configured.');
        }

        // Gemini の Interactions API を呼びます。
        // 新しい形式（AQ.）の API キーでは、以前の generateContent が 404 になるためです。
        // キーは URL に入れず、ヘッダーで送ります（記録に残りにくくするため）。
        $response = $this->http
            ->timeout(30)
            // 失敗しても例外を投げずに戻し、下の failed() で RuntimeException にそろえます。
            // （投げると RequestException になり、Controller で受け止められず 500 になるため）
            ->retry(2, 300, throw: false)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $apiKey,
                'Api-Revision' => '2026-05-20',
            ])
            ->post('https://generativelanguage.googleapis.com/v1beta/interactions', [
                'model' => $model,
                'input' => $this->buildPrompt($spot, $message),
                'generation_config' => [
                    'max_output_tokens' => 900,
                ],
            ]);

        if ($response->failed()) {
            // 原因を追えるよう、Gemini の状態コードとエラーの種類だけを記録に残します（キーは含めません）。
            throw new RuntimeException(sprintf(
                'Gemini API request failed: %d %s (model: %s)',
                $response->status(),
                (string) Arr::get($response->json() ?? [], 'error.status', ''),
                $model,
            ));
        }

        $answer = $this->extractText($response->json() ?? []);

        if ($answer === '') {
            throw new RuntimeException('Gemini API returned an empty answer.');
        }

        return trim($answer);
    }

    // 返事の steps のうち、最後の model_output の step から文（type: text）を取り出してつなげます。
    // 先頭には考えた過程（type: thought）の step が入ることがあるため、それは読みません。
    private function extractText(array $interaction): string
    {
        $outputs = array_values(array_filter(
            $interaction['steps'] ?? [],
            fn ($step) => is_array($step) && ($step['type'] ?? null) === 'model_output',
        ));
        $last = end($outputs);

        if (! is_array($last)) {
            return '';
        }

        $texts = array_map(
            fn ($content) => is_array($content) && ($content['type'] ?? null) === 'text' ? (string) ($content['text'] ?? '') : '',
            $last['content'] ?? [],
        );

        return trim(implode('', $texts));
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
