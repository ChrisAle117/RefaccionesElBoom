<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'openpay' => [
        'merchant_id' => env('OPENPAY_MERCHANT_ID'),
        'private_key' => env('OPENPAY_PRIVATE_KEY'),
        'public_key'  => env('OPENPAY_PUBLIC_KEY'),
        // Permitir ambos nombres y por defecto usar prod si APP_ENV=production
        'sandbox'     => env('OPENPAY_SANDBOX', env('OPENPAY_IS_SANDBOX', env('APP_ENV') !== 'production')),
    ], 

    'dhl' => [
        // Credenciales y entorno
        'username'       => env('DHL_API_USERNAME'),
        'password'       => env('DHL_API_PASSWORD'),
        'account_number' => env('DHL_ACCOUNT_NUMBER'),
        //   - Producción: https://express.api.dhl.com/mydhlapi
        //   - Sandbox:    https://express.api.dhl.com/mydhlapi/test
        'base_url'       => rtrim(env(
            'DHL_BASE_URL',
            env('APP_ENV') === 'production'
                ? 'https://express.api.dhl.com/mydhlapi'
                : 'https://express.api.dhl.com/mydhlapi/test'
        ), '/'),

        
        // Dirección fija de donde salen todos los envíos
        'origin' => [
            'postal_code'   => env('DHL_ORIGIN_POSTAL_CODE'),
            'city_name'     => env('DHL_ORIGIN_CITY'),
            'province_code' => env('DHL_ORIGIN_PROVINCE'),
            'country_code'  => env('DHL_ORIGIN_COUNTRY', 'MX'),
            'address_line1' => env('DHL_ORIGIN_ADDRESS_LINE1'),
        ],
        
        'pickup' => [
            // Mantener coherencia: tomar del mismo base_url final (sandbox o prod)
            'endpoint'    => rtrim(env(
                'DHL_BASE_URL',
                env('APP_ENV') === 'production'
                    ? 'https://express.api.dhl.com/mydhlapi'
                    : 'https://express.api.dhl.com/mydhlapi/test'
            ), '/') . '/pickups',
            'pickup_time' => env('DHL_PICKUP_TIME'),
        ],
    ],

    'ultramsg' => [
        'token'       => env('ULTRAMSG_TOKEN'),
        'instance_id' => env('ULTRAMSG_INSTANCE_ID'),
        'from'        => env('WHATSAPP_FROM'),
        'to'          => env('WHATSAPP_TO'),
    ],

    'phpmailer' => [
        'host'       => env('SMTP_HOST'),
        'port'       => env('SMTP_PORT'),
        'username'   => env('SMTP_USERNAME'),
        'password'   => env('SMTP_PASSWORD'),
        'encryption' => env('SMTP_ENCRYPTION', 'ssl'),
        'from' => [
            'address' => env('MAIL_FROM_ADDRESS','no-reply@refaccioneselboom.com'),
            'name'    => env('MAIL_FROM_NAME', 'El Boom Tractopartes - Tu tienda en línea'),
            ],
    ],

    // 'ga' => [
    //     'measurement_id' => env('GA_MEASUREMENT_ID'),
    //     'send_manual_pageviews' => (bool) env('GA_SEND_MANUAL_PAGEVIEWS', false),
    // ],
    // 'gtm' => [
    //     'container_id' => env('GTM_ID'),
    // ],

    // // Google Ads Conversion Tracking
    // 'google_ads' => [
        
    //     'conversion_id'    => env('GOOGLE_ADS_CONVERSION_ID'),
    //     'conversion_label' => env('GOOGLE_ADS_CONVERSION_LABEL'),
    //     'currency'         => env('GOOGLE_ADS_CURRENCY', 'MXN'),
    // ],

];
