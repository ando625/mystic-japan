<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Seed a predictable demo user for local API review.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'traveler@example.com'],
            [
                'name' => '旅人',
                'password' => Hash::make('password'),
            ],
        );
    }
}
