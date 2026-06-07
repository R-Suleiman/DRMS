<?php

namespace Database\Seeders;

use App\Models\AllRecords;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class AllRecordsSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        for ($i = 1; $i <= 10; $i++) {
            AllRecords::create([
                'record_number' => 'REC' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'record_type' => $faker->randomElement(['personal', 'service']),
            ]);
        }
    }
}

