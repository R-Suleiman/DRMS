<?php

namespace Database\Seeders;

use App\Models\Record;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class RecordsSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        for ($i = 1; $i <= 10; $i++) {
            Record::create([
                'record_id' => $i,
                'first_name'  => $faker->firstName,
                'middle_name' => $faker->optional()->firstName,
                'last_name'   => $faker->lastName,
                'phone'       => $faker->unique()->phoneNumber,
                'dob'         => $faker->date('Y-m-d', '-18 years'),
                'gender'      => $faker->randomElement(['M', 'F']),
                'email'       => $faker->unique()->safeEmail,
                'photo'    => 'photos/'.$faker->uuid.'.jpg',
            ]);
        }
    }
}

