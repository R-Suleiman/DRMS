<?php

namespace Database\Seeders;

use App\Models\DocumentCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentCategorySeeder extends Seeder
{
    use WithoutModelEvents;

    public function run()
    {
        DocumentCategory::firstOrCreate(
            ['category_name' => 'Certificates'],
        );

    }
}

