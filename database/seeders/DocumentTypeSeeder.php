<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run()
    {
        DocumentType::firstOrCreate(
            ['category_id' => 1],
            ['name' => 'Form 4'],
        );

        DocumentType::firstOrCreate(
            ['category_id' => 1],
            ['name' => 'Form 6'],
        );
    }
}

