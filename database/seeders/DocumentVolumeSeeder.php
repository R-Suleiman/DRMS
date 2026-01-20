<?php

namespace Database\Seeders;

use App\Models\DocumentVolume;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentVolumeSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run()
    {
        for($i = 1; $i <= 5; $i++) {
            DocumentVolume::firstOrCreate(
                ['volume_name' => 'Volume ' . $i],
            );
        }
    }
}

