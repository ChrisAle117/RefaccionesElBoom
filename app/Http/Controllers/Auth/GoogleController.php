<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;

    public function __construct()
    {
        $this->clientId     = config('services.google.client_id');
        $this->clientSecret = config('services.google.client_secret');
        $this->redirectUri  = config('services.google.redirect');
    }

    /**
     * Redirige al usuario a Google para autenticación.
     */
    public function redirectToGoogle()
    {
        $state = Str::random(40);
        session(['google_oauth_state' => $state]);

        $params = http_build_query([
            'client_id'     => $this->clientId,
            'redirect_uri'  => $this->redirectUri,
            'response_type' => 'code',
            'scope'         => 'openid email profile',
            'state'         => $state,
            'access_type'   => 'online',
            'prompt'        => 'select_account',
        ]);

        return redirect('https://accounts.google.com/o/oauth2/v2/auth?' . $params);
    }

    /**
     * Maneja el callback de Google.
     */
    public function handleGoogleCallback()
    {
        // Apache no pasa QUERY_STRING a PHP en este servidor.
        // Parseamos REQUEST_URI directamente para obtener code y state.
        $queryString = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_QUERY) ?? '';
        parse_str($queryString, $params);

        $state = $params['state'] ?? request('state');
        $code  = $params['code']  ?? request('code');

        // Verificar state (no-fatal — sesión puede diferir en hosting compartido)
        if ($state !== session('google_oauth_state')) {
            \Log::warning('Google OAuth: state mismatch. Session: ' . session('google_oauth_state') . ' | URL: ' . $state);
        }

        if (!$code) {
            \Log::error('Google OAuth: no se recibió code. Params: ' . json_encode($params));
            return redirect()->route('login')
                ->withErrors(['google' => 'No se recibió autorización de Google.']);
        }

        // 1. Intercambiar code por access token
        $tokenResponse = $this->exchangeCodeForToken($code);
        if (!isset($tokenResponse['access_token'])) {
            \Log::error('Google OAuth token error: ' . json_encode($tokenResponse));
            $errMsg = $tokenResponse['error_description'] ?? $tokenResponse['error'] ?? 'Error desconocido al obtener token.';
            return redirect()->route('login')
                ->withErrors(['google' => 'Google: ' . $errMsg]);
        }

        // 2. Obtener datos del usuario de Google
        $googleUser = $this->getGoogleUser($tokenResponse['access_token']);
        if (!isset($googleUser['email'])) {
            \Log::error('Google OAuth userinfo error: ' . json_encode($googleUser));
            return redirect()->route('login')
                ->withErrors(['google' => 'No se pudo obtener la información del usuario de Google.']);
        }

        // 3. Buscar o crear usuario
        $user = User::where('google_id', $googleUser['sub'])
            ->orWhere('email', $googleUser['email'])
            ->first();

        if ($user) {
            // Vincular google_id si no lo tenía
            if (!$user->google_id) {
                $user->update(['google_id' => $googleUser['sub']]);
            }
        } else {
            $user = User::create([
                'name'      => $googleUser['name'] ?? $googleUser['email'],
                'email'     => $googleUser['email'],
                'google_id' => $googleUser['sub'],
                'password'  => null,
            ]);
        }

        Auth::login($user, true);

        return redirect()->intended('/');
    }

    /**
     * Intercambia el código de autorización por un access token.
     */
    private function exchangeCodeForToken(string $code): array
    {
        $ch = curl_init('https://oauth2.googleapis.com/token');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_POSTFIELDS     => http_build_query([
                'code'          => $code,
                'client_id'     => $this->clientId,
                'client_secret' => $this->clientSecret,
                'redirect_uri'  => $this->redirectUri,
                'grant_type'    => 'authorization_code',
            ]),
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        ]);
        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            \Log::error('Google token cURL error: ' . $curlError);
            return ['error' => $curlError];
        }

        return json_decode($response, true) ?? [];
    }

    /**
     * Obtiene los datos del usuario usando el access token.
     */
    private function getGoogleUser(string $accessToken): array
    {
        $ch = curl_init('https://www.googleapis.com/oauth2/v3/userinfo');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_HTTPHEADER     => ["Authorization: Bearer $accessToken"],
        ]);
        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            \Log::error('Google userinfo cURL error: ' . $curlError);
            return [];
        }

        return json_decode($response, true) ?? [];
    }
}
