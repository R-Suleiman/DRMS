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
            'create_user',
            'update_user',
            'delete_user',
            'reset_user_password',
            'upload_document',
            'view_records',
            'update_record',
            'delete_record',
            'view_document',
            'view_dashboard',
            'delete_document',
            'change_password',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => $guard,
            ]);
        }

        $rootAdmin = Role::firstOrCreate([
            'name' => 'root admin',
            'guard_name' => $guard,
        ]);

        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => $guard,
        ]);

        $registrar = Role::firstOrCreate([
            'name' => 'registrar',
            'guard_name' => $guard,
        ]);

        $rootAdmin->syncPermissions(Permission::where('guard_name', $guard)->get());

        $admin->syncPermissions(Permission::where('guard_name', $guard)->get());

        $registrar->syncPermissions([
            'create_user',
            'update_user',
            'delete_user',
            'upload_document',
            'view_records',
            'update_record',
            'delete_record',
            'delete_document',
            'view_dashboard',
            'view_document',
            'change_password',
        ]);
    }
}
