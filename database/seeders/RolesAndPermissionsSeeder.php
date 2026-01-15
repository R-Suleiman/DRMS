<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run()
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]
            ->forgetCachedPermissions();

        $guard = 'api';

        $permissions = [
            'manage_users',
            'manage_roles',
            'create_person',
            'update_person',
            'upload_document',
            'view_records',
            'view_document',
            'view_dashboard',
            'delete_document',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => $guard,
            ]);
        }

        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => $guard,
        ]);

        $registrar = Role::firstOrCreate([
            'name' => 'registrar',
            'guard_name' => $guard,
        ]);

        $admin->syncPermissions(Permission::where('guard_name', $guard)->get());

        $registrar->syncPermissions([
            'create_person',
            'update_person',
            'upload_document',
            'view_records',
            'delete_document',
            'view_dashboard',
            'view_document',
        ]);
    }
}
