<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class DepartmentsSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        for ($i = 1; $i <= 5; $i++) {
            Department::create([
                'name'  => $faker->company,
                'short_name' => $faker->unique()->lexify('DEPT???'),
            ]);
        }
    }
}




