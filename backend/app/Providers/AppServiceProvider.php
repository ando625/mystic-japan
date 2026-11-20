<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // AI旅ガイドの回数制限です（routes/api.php の throttle:ai-guide）。
        // 1人あたり（1分・1日）と、全員あわせた1日の回数を数え、どれかを超えたら429を返します。
        RateLimiter::for('ai-guide', function (Request $request) {
            $userKey = 'user:'.$request->user()?->getAuthIdentifier();
            $tooMany = fn () => response()->json([
                'message' => 'AI旅ガイドへの質問が多すぎます。少し時間をおいてからお試しください。',
            ], 429);

            return [
                Limit::perMinute(config('services.gemini.guide_per_minute'))->by('minute:'.$userKey)->response($tooMany),
                Limit::perDay(config('services.gemini.guide_per_user_per_day'))->by('day:'.$userKey)->response($tooMany),
                Limit::perDay(config('services.gemini.guide_total_per_day'))->by('day:all')->response($tooMany),
            ];
        });
    }
}
