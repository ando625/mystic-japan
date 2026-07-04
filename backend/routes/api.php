<?php

use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\AiGuideController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\SpotController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/spots', [SpotController::class, 'index']);
Route::get('/spots/{spot}', [SpotController::class, 'show'])->name('spots.show');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/spots/{spot}/unlock', [SpotController::class, 'unlock']);
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::get('/achievements', [AchievementController::class, 'index']);
    Route::post('/ai/guide', AiGuideController::class);
});
