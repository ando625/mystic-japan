<?php

$frontendOrigins = array_filter(array_map(
    'trim',
    explode(',', env('FRONTEND_URL', 'http://localhost:3000')),
));

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing
    |--------------------------------------------------------------------------
    |
    | The Next.js frontend runs on a different origin from the Laravel API in
    | local Docker and on Render, so we explicitly allow those origins here.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_merge(
        $frontendOrigins,
        ['http://localhost:3000', 'http://127.0.0.1:3000'],
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
