<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        $token = $user->createToken('main', ['*'])->accessToken;
        $user->tokens()->latest()->first()->update([
            'expires_at' => now()->addDays(7) // or addDays(7)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
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
}
