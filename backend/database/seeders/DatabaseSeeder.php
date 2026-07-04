<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 個別Seederに分けることで、初期データの種類ごとに保守しやすくしています。
        $this->call([
            DemoUserSeeder::class,
            SpotSeeder::class,
            AchievementSeeder::class,
        ]);
    }
}
