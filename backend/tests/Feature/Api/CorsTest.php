<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class CorsTest extends TestCase
{
    public function test_render_frontend_origin_can_preflight_login_request(): void
    {
        config([
            'cors.allowed_origins' => ['https://mystic-japan-web.onrender.com'],
        ]);

        $response = $this->withHeaders([
            'Origin' => 'https://mystic-japan-web.onrender.com',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'content-type',
        ])->options('/api/login');

        $this->assertContains($response->getStatusCode(), [200, 204]);
        $this->assertSame(
            'https://mystic-japan-web.onrender.com',
            $response->headers->get('Access-Control-Allow-Origin'),
        );
    }
}
