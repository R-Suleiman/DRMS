<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttpStatusCode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    // app/Http/Middleware/ForceHttpStatusCode.php
public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        http_response_code($response->getStatusCode());
        return $response;
    }
}
