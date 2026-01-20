<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', '');
        $sortBy = $request->input('sort_by', '');
        $sortDirection = $request->input('sort_order', 'asc');
        $search = $request->input('search', '');

        $columnFilters = $request->all();
        unset($columnFilters['per_page'], $columnFilters['page'], $columnFilters['sort_by'], $columnFilters['sort_order'], $columnFilters['search']);

        $UsersQuery = User::query()->with('roles')
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'root admin');
            })
            ->where(function ($query) use ($search) {
                if (!empty($search)) {
                    $query->where('first_name', 'like', "%$search%")
                        ->orWhere('middle_name', 'like', "%$search%")
                        ->orWhere('last_name', 'like', "%$search%")
                        ->orWhere('email', 'like', "%$search%")
                        ->orWhereHas('roles', function ($q) use ($search) {
                            $q->where('name', 'like', "%$search%");
                        });
                }
            });

        foreach ($columnFilters as $column => $value) {
            if ($value === '' || $value === null) {
                continue;
            }
            if ($column === 'role') {
                $UsersQuery->whereHas('roles', function ($q) use ($value) {
                    $q->where('name', 'like', "%$value%");
                });
            } else {
                $UsersQuery->where("users.$column", 'like', "%$value%");
            }
        }

        $users = $UsersQuery->orderBy($sortBy, $sortDirection)->paginate($perPage);

        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'middle_name' => $user->middle_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'created_at' => $user->created_at->toDateTimeString(),
            ];
        });

        return response()->json(['success' => true, 'users' => $users], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|min:3',
            'middle_name' => 'nullable|string|min:3',
            'last_name' => 'required|string|min:3',
            'email' => 'required|email|unique:users,email',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make(Str::lower($request->last_name)),
        ]);

        $user->assignRole('registrar');

        return response()->json([
            'success' => true,
            'message' => 'User created successfully'
        ]);
    }

    public function show($userId)
    {
        $user = User::with('roles')->findOrFail($userId);

        return response()->json([
            'id' => $user->id,
            'roles' => $user->roles->pluck('name'),
        ]);
    }

    public function update(Request $request, $userId)
    {
        $request->validate([
            'first_name' => 'required|string|min:3',
            'middle_name' => 'nullable|string|min:3',
            'last_name' => 'required|string|min:3',
            'email' => 'required|email',
        ]);

        $user = User::find($userId);

        $user->update([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully'
        ]);
    }

    public function destroy($userId)
    {
        $user = User::with('roles')->where('id', $userId)->first();

        foreach ($user->roles as $role) {
            if ($role->name === 'root admin') {
                return response()->json(['message' => 'Admin user cannot be deleted'], 403);
            }
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
