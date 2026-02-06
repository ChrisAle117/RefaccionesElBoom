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
            
            // Validate webhook signature if configured
            if ($this->shouldValidateSignature()) {
                if (!$this->validateSignature($request)) {
                    Log::warning('Openpay webhook signature validation failed', [
                        'ip' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ]);
                    return response('Unauthorized', 401);
                }
            }
            
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

    /**
     * Determine if webhook signature validation should be performed
     */
    private function shouldValidateSignature(): bool
    {
        return (bool) config('openpay.webhook.validate_signature', false);
    }

    /**
     * Validate the Openpay webhook signature
     */
    private function validateSignature(Request $request): bool
    {
        $signature = $request->header('X-Openpay-Signature');
        $secret = config('openpay.webhook.secret');
        
        if (!$signature || !$secret) {
            return false;
        }

        // Normalize signature (remove whitespace, convert to lowercase)
        $signature = strtolower(trim($signature));

        $payload = $request->getContent();
        $expectedSignature = strtolower(hash_hmac('sha256', $payload, $secret));
        
        return hash_equals($expectedSignature, $signature);
    }
}
