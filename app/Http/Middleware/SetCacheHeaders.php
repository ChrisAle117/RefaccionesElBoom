<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCacheHeaders
{
    /**
     * Handle an incoming request and set appropriate cache headers.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only cache GET requests
        if (!$request->isMethod('GET')) {
            return $response;
        }

        $path = $request->path();

        // Static images - cache for 1 year (immutable if versioned, otherwise 30 days)
        if (preg_match('/\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i', $path)) {
            // Check if it's a versioned asset (contains hash or version query param)
            if ($request->hasAny(['v', 'version']) || preg_match('/\.[a-f0-9]{8,}\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i', $path)) {
                $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
            } else {
                // Regular images - cache for 30 days
                $response->headers->set('Cache-Control', 'public, max-age=2592000');
            }
        }

        // Fonts - cache for 1 year (usually versioned)
        if (preg_match('/\.(woff|woff2|ttf|eot|otf)$/i', $path)) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
        }

        // CSS/JS from build directory - cache for 1 year (versioned by Vite)
        if (preg_match('/^build\//', $path) && preg_match('/\.(css|js)$/i', $path)) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
        }

        return $response;
    }
}
