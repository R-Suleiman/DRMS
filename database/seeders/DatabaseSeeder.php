<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run()
    {
        $this->call([
            \Database\Seeders\RolesAndPermissionsSeeder::class,
            \Database\Seeders\RootAdminSeeder::class,
            \Database\Seeders\RecordsSeeder::class,
            \Database\Seeders\DocumentCategorySeeder::class,
            \Database\Seeders\DocumentTypeSeeder::class,
        ]);
    }
}
