<?php

namespace App\Http\Middleware;

use Closure;

class IsTokenExpired
{

    public function handle($request, Closure $next)
    {
        // the time difference
        $token = $request->user()?->currentAccessToken();

        if ($token && $token->expires_at && $token->expires_at->isPast()) {
            $token->delete();
            return response()->json(['message' => 'Token expired, please log in again.'], 401);
        }

        return $next($request);
    }
}
