<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_health_endpoint_returns_operational_status(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'uptime_status',
                'environment',
                'timestamp',
                'services' => [
                    'database',
                    'cosing_eu',
                    'ncbi_pubmed',
                ],
                'node' => [
                    'name',
                    'location',
                    'contingency_mode',
                ],
                'version',
            ])
            ->assertJson([
                'status' => 'operational',
                'uptime_status' => 'online',
                'services' => [
                    'database' => 'connected',
                ],
            ]);
    }
}
