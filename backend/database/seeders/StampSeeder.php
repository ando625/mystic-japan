<?php

namespace Database\Seeders;

use App\Models\Spot;
use App\Models\Stamp;
use Illuminate\Database\Seeder;

class StampSeeder extends Seeder
{
    public function run(): void
    {
        Spot::query()->orderBy('id')->each(function (Spot $spot): void {
            Stamp::query()->updateOrCreate(
                ['spot_id' => $spot->id],
                [
                    'name' => "{$spot->name} 御朱印",
                    'description' => "{$spot->region}の記憶を宿した、{$spot->name}の幻想御朱印です。",
                    'image_path' => "generated:goshuin:{$spot->id}",
                    'rarity' => $spot->rarity,
                ],
            );
        });
    }
}
