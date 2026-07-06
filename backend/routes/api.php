<?php

use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\AiGuideController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\SpotController;
use App\Http\Controllers\Api\StampController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/spots', [SpotController::class, 'index']);
Route::get('/spots/{spot}', [SpotController::class, 'show'])->name('spots.show');
Route::get('/spots/{spot}/quizzes', [QuizController::class, 'index']);
Route::get('/stamps', [StampController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/spots/{spot}/unlock', [SpotController::class, 'unlock']);
    Route::post('/spots/{spot}/visit', [SpotController::class, 'visit']);
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::get('/achievements', [AchievementController::class, 'index']);
    Route::get('/me/stamps', [StampController::class, 'mine']);
    Route::post('/stamps/{stamp}/obtain', [StampController::class, 'obtain']);
    Route::post('/quizzes/{quiz}/answer', [QuizController::class, 'answer']);
    Route::post('/ai/guide', AiGuideController::class);
});
