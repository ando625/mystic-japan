<?php

$configuredOrigins = env(
    'CORS_ALLOWED_ORIGINS',
    env('FRONTEND_URL', 'http://localhost:3000'),
);

$frontendOrigins = array_filter(array_map('trim', explode(',', $configuredOrigins)));

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing
    |--------------------------------------------------------------------------
    |
    | The Next.js frontend runs on a different origin from the Laravel API.
    | CORS_ALLOWED_ORIGINS can contain comma-separated origins for production
    | and local development.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_merge(
        $frontendOrigins,
        [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://mystic-japan-web.onrender.com',
        ],
    ))),

    'allowed_origins_patterns' => [
        '#^https://mystic-japan-web\.onrender\.com$#',
        '#^https://[a-z0-9-]+-web\.onrender\.com$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
