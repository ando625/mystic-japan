<?php

use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\AiGuideController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\SpotController;
use App\Http\Controllers\Api\StampController;
use Illuminate\Support\Facades\Route;

// 認証なしで使えるAPIです。
// 新規登録・ログインは、まだトークンを持っていないユーザーが呼ぶ入口です。
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 公開データ取得APIです。
// 未ログインでもスポット・クイズ・御朱印の一覧は見られますが、個人の進行状態は保存されません。
Route::get('/spots', [SpotController::class, 'index']);
Route::get('/spots/{spot}', [SpotController::class, 'show'])->name('spots.show');
Route::get('/spots/{spot}/quizzes', [QuizController::class, 'index']);
Route::get('/stamps', [StampController::class, 'index']);

// ここから下はSanctumのBearerトークンが必要なAPIです。
// ユーザーごとの解放状態、クイズ回答、御朱印、称号などDBに保存する処理をまとめています。
Route::middleware('auth:sanctum')->group(function (): void {
    // ログアウトと、自分自身のユーザー情報・進行サマリー取得です。
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // スポット進行APIです。現在のUIでは主にクイズ達成で解放しますが、互換用にunlock/visitも残しています。
    Route::post('/spots/{spot}/unlock', [SpotController::class, 'unlock']);
    Route::post('/spots/{spot}/visit', [SpotController::class, 'visit']);

    // 図鑑・称号・御朱印帳で使う、ログインユーザー専用の進行データ取得APIです。
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::get('/achievements', [AchievementController::class, 'index']);
    Route::get('/me/stamps', [StampController::class, 'mine']);
    Route::post('/stamps/{stamp}/obtain', [StampController::class, 'obtain']);

    // クイズ回答APIです。正解数が条件を満たすと、御朱印獲得とスポット解放まで行います。
    Route::post('/quizzes/{quiz}/answer', [QuizController::class, 'answer']);
    Route::post('/spots/{spot}/quizzes/retry', [QuizController::class, 'retry']);

    // AI旅ガイドAPIです。Next.jsから直接Geminiへ送らず、Laravelでスポット情報を付けて送信します。
    Route::post('/ai/guide', AiGuideController::class);
});
