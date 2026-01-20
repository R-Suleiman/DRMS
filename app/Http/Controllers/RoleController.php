<?php

namespace App\Http\Controllers;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', '');
        $sortBy = $request->input('sort_by', '');
        $sortDirection = $request->input('sort_order', 'asc');
        $search = $request->input('search', '');

        $RolesQuery = Role::query()
            ->where('name', '!=', 'root admin')
            ->where(function ($query) use ($search) {
                if (!empty($search)) {
                    $query->where('name', 'like', "%$search%");
                }
            });

        $roles = $RolesQuery->orderBy($sortBy, $sortDirection)->paginate($perPage);

        return response()->json(['success' => true, 'roles' => $roles], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
        ]);

        Role::create([
            'name' => $request->name,
            'guard_name' => 'api',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully'
        ]);
    }

    public function show($roleId)
    {
        $role = Role::with('permissions')->findOrFail($roleId);

        return response()->json([
            'id' => $role->id,
            'name' => $role->name,
            'permissions' => $role->permissions->pluck('name'),
        ]);
    }

    public function update(Request $request, $roleId)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,' . $roleId,
        ]);

        $role = Role::find($roleId);

        if ($role->name === 'root admin') {
            return response()->json([
                'message' => 'Admin Role cannot be changed'
            ], 403);
        }

        $role->update(['name' => $request->name]);

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully'
        ]);
    }

    public function syncPermissions(Request $request, $roleId)
    {
        $request->validate([
            'permissions' => 'array',
        ]);

        $role = Role::find($roleId);

        $role->syncPermissions($request->permissions);

        return response()->json([
            'success' => true,
            'message' => 'Permission updated successfully'
        ]);
    }

    public function destroy($roleId)
    {
        $role = Role::find($roleId);

        if ($role->name === 'root admin') {
            return response()->json(['message' => 'Admin role cannot be deleted'], 403);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully'
        ]);
    }

    public function assignRole(Request $request, $userId)
    {
        $request->validate(
            [
                'roles' => 'required|array',
                'roles.*' => 'exists:roles,name',
            ],
            [
                'roles.required' => 'Atleast one role is required for the user'
            ]
        );

        $user = User::findOrFail($userId);

        $user->syncRoles($request->roles);

        return response()->json([
            'success' => true,
            'message' => 'Roles updated successfully'
        ]);
    }

    public function getRoles()
    {
        $roles = Role::where('name', '!=', 'root admin')->get();

        return response()->json($roles);
    }
}
