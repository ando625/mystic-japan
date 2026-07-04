<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spots', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('region');
            $table->string('prefecture');
            $table->string('category', 100)->index();
            $table->text('description');
            $table->text('mythology');
            $table->text('history');
            $table->text('trivia');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('image_url', 2048)->nullable();
            $table->string('music_url', 2048)->nullable();
            $table->string('video_url', 2048)->nullable();
            $table->unsignedTinyInteger('rarity')->default(1);
            $table->unsignedInteger('mystic_points')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spots');
    }
};
