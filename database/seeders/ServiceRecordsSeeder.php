<?php

namespace Database\Seeders;

use App\Models\ServiceRecord;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ServiceRecordsSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        for ($i = 1; $i <= 10; $i++) {
            ServiceRecord::create([
                'record_id' => $i,
                'service_name'  => $faker->firstName,
                'description' => $faker->sentence,
                'department_id' => $faker->randomElement([1, 2, 3]),
                'is_classified' => $faker->boolean,
            ]);
        }
    }
}

