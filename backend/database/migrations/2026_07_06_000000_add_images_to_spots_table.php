<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spots', function (Blueprint $table): void {
            $table->json('images')->nullable()->after('image_url');
        });
    }

    public function down(): void
    {
        Schema::table('spots', function (Blueprint $table): void {
            $table->dropColumn('images');
        });
    }
};
