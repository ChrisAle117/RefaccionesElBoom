<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessOpenpayWebhook;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class OpenpayWebhookController extends Controller
{
    public function handle(Request $request)
    {
        
        if ($request->isMethod('get') && $request->query('verification')) {
            $code = $request->query('verification');
            Log::info("Openpay webhook verification received: {$code}");
            // Devuelve el código en texto plano para que Openpay lo valide
            return response($code, 200)
                        ->header('Content-Type', 'text/plain');
        }

        if ($request->isMethod('post')) {
            $payload = $request->all();
            Log::info('Openpay webhook payload received:', $payload);

            try {
                // Encolamos el job que creará la guía DHL
                ProcessOpenpayWebhook::dispatch($payload);
            } catch (\Throwable $e) {
                // Si algo falla al encolar, lo registramos pero devolvemos 200 igual
                Log::error('Error dispatching ProcessOpenpayWebhook: ' . $e->getMessage());
            }

            // Respondemos OK para que Openpay no reintente
            return response('OK', 200);
        }

        return response('Method Not Allowed', 405);
    }
}
