<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class RootAdminSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run()
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Root Admin',
                'password' => Hash::make('password'),
            ]
        );

        $user->assignRole('admin');
    }
}

