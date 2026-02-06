<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Openpay Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Openpay payment gateway integration
    |
    */

    'merchant_id' => env('OPENPAY_MERCHANT_ID'),
    
    'private_key' => env('OPENPAY_PRIVATE_KEY'),
    
    'public_key' => env('OPENPAY_PUBLIC_KEY'),
    
    'sandbox' => (bool) env('OPENPAY_SANDBOX', true),

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for secure webhook handling
    |
    */

    'webhook' => [
        'validate_signature' => (bool) env('OPENPAY_WEBHOOK_VALIDATE_SIGNATURE', false),
        'secret' => env('OPENPAY_WEBHOOK_SECRET'),
    ],
];
