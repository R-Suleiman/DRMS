<?php

namespace App\Http\Controllers;

use App\Mail\OtpCodeMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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

        $user = Auth::user();
        $otp = $this->createOtpCode($user);

        return response()->json([
            'success' => true,
            'message' => 'A verification code has been sent to your email.',
            'two_factor_required' => true,
            'otp_token' => $otp->otp_token,
            'email' => $user->email,
        ], 200);
    }

    public function verifyOtp(Request $request)
    {
        $attributes = $request->validate([
            'email' => ['required', 'email'],
            'otp_code' => 'required|string',
            'otp_token' => 'required|string',
        ]);

        $user = User::where('email', $attributes['email'])->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials'], 422);
        }

        $otp = OtpCode::where('user_id', $user->id)
            ->where('otp_token', $attributes['otp_token'])
            ->where('code', $attributes['otp_code'])
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired verification code.'], 422);
        }

        $otp->update(['used_at' => now()]);

        $user = $user->load('roles');
        $token = $user->createToken('main', ['*'])->plainTextToken;
        $user->tokens()->latest()->first()->update([
            'expires_at' => now()->addDays(7)
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
        ], 200);
    }

    public function resendOtp(Request $request)
    {
        $attributes = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $attributes['email'])->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Email not found.'], 404);
        }

        $user->otpCodes()->whereNull('used_at')->update(['used_at' => now()]);

        $otp = $this->createOtpCode($user);

        return response()->json([
            'success' => true,
            'message' => 'A new verification code has been sent to your email.',
            'otp_token' => $otp->otp_token,
            'email' => $user->email,
        ], 200);
    }

    protected function createOtpCode(User $user): OtpCode
    {
        $code = str_pad(strval(rand(0, 999999)), 6, '0', STR_PAD_LEFT);

        $otp = OtpCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'otp_token' => Str::random(60),
            'expires_at' => now()->addMinutes(15),
        ]);

        Mail::to("r.suleiman2901@gmail.com")->send(new OtpCodeMail($otp));
        // Mail::to($user->email)->send(new OtpCodeMail($otp));

        return $otp;
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
