<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spots', function (Blueprint $table): void {
            $table->boolean('is_initially_unlocked')->default(false)->after('mystic_points');
        });

        Schema::create('user_spots', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('spot_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_unlocked')->default(false);
            $table->timestamp('unlocked_at')->nullable();
            $table->timestamp('visited_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'spot_id']);
            $table->index(['user_id', 'is_unlocked']);
            $table->index('spot_id');
        });

        Schema::create('stamps', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('spot_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description');
            $table->string('image_path')->nullable();
            $table->unsignedTinyInteger('rarity')->default(1);
            $table->timestamps();

            $table->unique('spot_id');
        });

        Schema::create('user_stamps', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('stamp_id')->constrained()->cascadeOnDelete();
            $table->timestamp('obtained_at');
            $table->timestamps();

            $table->unique(['user_id', 'stamp_id']);
            $table->index('stamp_id');
        });

        Schema::create('quizzes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('spot_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->string('option_a');
            $table->string('option_b');
            $table->string('option_c');
            $table->string('option_d');
            $table->char('correct_option', 1);
            $table->text('explanation');
            $table->unsignedInteger('reward_points')->default(30);
            $table->timestamps();

            $table->index('spot_id');
        });

        Schema::create('quiz_answers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->char('selected_option', 1);
            $table->boolean('is_correct');
            $table->timestamp('answered_at');
            $table->timestamps();

            $table->unique(['user_id', 'quiz_id']);
            $table->index(['user_id', 'is_correct']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_answers');
        Schema::dropIfExists('quizzes');
        Schema::dropIfExists('user_stamps');
        Schema::dropIfExists('stamps');
        Schema::dropIfExists('user_spots');

        Schema::table('spots', function (Blueprint $table): void {
            $table->dropColumn('is_initially_unlocked');
        });
    }
};
