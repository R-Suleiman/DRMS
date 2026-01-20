<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => 'required'
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['success' => false, 'message' => 'Invalid Credentials'], 422);
        }

        $user = Auth::user()->load('roles');

        $token = $user->createToken('main', ['*'])->plainTextToken;
        $user->tokens()->latest()->first()->update([
            'expires_at' => now()->addDays(7) // or addDays(7)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'middle_name' => $user->middle_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'roles' => $user->roles,
                'permissions' => $user->getAllPermissions(),
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json(['success' => true, 'message' => 'Successfully logged out'], 200);
    }

    public function changePassword(Request $request)
    {
        $attributes = request()->validate([
            'old_password' => 'required',
            'new_password' => ['required', Password::min(8)->letters()->symbols(), 'confirmed']
        ]);

        $user = Auth::user();

        if (!Hash::check($attributes['old_password'], $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid old password'], 422);
        }

        $user->update(['password' => bcrypt($attributes['new_password'])]);

        return response()->json(['success' => true, 'message' => 'Password changed successfully!'], 200);
    }

    public function resetUserPassword($userId) {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User Not Found'], 404);
        }

        $lastName = $user->last_name;

        $user->update(['password' => bcrypt(Str::lower($lastName))]);

        return response()->json(['success' => true, 'message' => 'Password reset successfully!'], 200);
    }
}
